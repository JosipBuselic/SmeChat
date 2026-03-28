/**
 * Loads data from data.zagreb.hr (GeoJSON + CKAN datastore) and recycling yards (ArcGIS).
 * Zeleni otoci: tabular only — coordinates via Photon (Komoot) geocoding, batched + cached in-module.
 * Dev: `vite.config` proxies `/api/zagreb`; Photon is called directly (CORS open).
 */

export const MAX_DISPLAYED_FACILITIES = 10;
/** Roughly how many of the 10 nearest should be zeleni otoci when enough exist. */
export const GREEN_ISLAND_NEAREST_TARGET = 5;

export const ZAGREB_CENTER = { lat: 45.815_011, lng: 15.981_919 };

const PODZEMNI_GEOJSON =
  "/dataset/1c02bf11-26a8-40dd-9a7d-0635dc065325/resource/980478d5-97a8-4b7d-8e92-f404bd0d3a24/download/data.geojson";

const POLUPODZEMNI_GEOJSON =
  "/dataset/a48f972b-9639-4719-9470-9d398049dbf9/resource/c04a1f0c-ac8a-4156-ba1f-707b1564d2f8/download/data.geojson";

const RECYCLING_YARDS_GEOJSON =
  "/api/v3/datasets/249fa384ccf9481abf4fd2de73a822f5_0/downloads/data?format=geojson&spatialRefId=4326&where=1%3D1";

const ZELENI_OTOCI_RESOURCE_ID = "5d15eae4-6aa7-426c-b02c-a8fdb3d61a74";

const PHOTON_BATCH = 4;
const PHOTON_BATCH_GAP_MS = 220;

function dataZagrebBase(): string {
  return import.meta.env.DEV ? "/api/zagreb" : "https://data.zagreb.hr";
}

function arcgisBase(): string {
  return import.meta.env.DEV ? "/api/arcgis" : "https://opendata.arcgis.com";
}

export type MapFacilityKind =
  | "green_island"
  | "recycling_yard"
  | "underground_bin"
  | "semi_underground_bin";

const OTHER_KINDS_FOR_COVERAGE: MapFacilityKind[] = [
  "recycling_yard",
  "underground_bin",
  "semi_underground_bin",
];

export interface MapFacility {
  id: string;
  kind: MapFacilityKind;
  name: string;
  address: string;
  lat: number;
  lng: number;
  accepts: string[];
  district?: string;
  distanceKm?: number;
  /** True for podzemni / polupodzemni — access may be restricted to residents. */
  mayRequireResidentAccess: boolean;
}

/** Deduped across React Strict Mode double-mount and concurrent callers. */
let zeleniFacilitiesCache: MapFacility[] | null = null;
let zeleniInflight: Promise<MapFacility[]> | null = null;

interface GeoJsonFeature {
  type: string;
  geometry?: { type: string; coordinates?: number[] };
  properties?: Record<string, unknown>;
  id?: number | string;
}

interface GeoJsonCollection {
  type: string;
  features?: GeoJsonFeature[];
}

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function cleanQuotes(value: unknown): string {
  if (value == null) return "";
  const s = String(value).trim();
  return s.replace(/^["\s]+|["\s]+$/g, "").trim();
}

function firstAddressLine(adrese: unknown): string {
  if (adrese == null) return "";
  const raw = String(adrese).split(/\r?\n/)[0]?.trim() ?? "";
  return raw;
}

function defaultBinAccepts(): string[] {
  return ["plastic", "paper", "glass", "bio", "mixed"];
}

/** Zeleni otoci: separated glass / metal / paper fractions */
function acceptsGreenIsland(): string[] {
  return ["glass", "plastic", "paper", "mixed"];
}

function acceptsFromRecyclingYard(props: Record<string, unknown>): string[] {
  const out: string[] = [];
  if (props.PAPIR === "DA") out.push("paper");
  if (props.PLASTIKA === "DA") out.push("plastic");
  if (props.STAKLO === "DA") out.push("glass");
  if (props.METALNA_AM === "DA") out.push("plastic");
  if (props.STARE_BATE === "DA") out.push("batteries");
  if (props.BIOOTPAD === "DA") out.push("bio");
  if (props.OTPAD_MU === "DA") out.push("mixed");
  if (props.OSTALO === "DA") out.push("textile");
  return [...new Set(out)];
}

function pointFromFeature(f: GeoJsonFeature): { lng: number; lat: number } | null {
  const g = f.geometry;
  if (!g || g.type !== "Point" || !Array.isArray(g.coordinates) || g.coordinates.length < 2) {
    return null;
  }
  const [lng, lat] = g.coordinates;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lng, lat };
}

function parseCollection(text: string): GeoJsonCollection {
  const data = JSON.parse(text) as GeoJsonCollection;
  if (data.type !== "FeatureCollection" || !Array.isArray(data.features)) {
    throw new Error("Invalid GeoJSON");
  }
  return data;
}

async function fetchGeoJson(path: string, base: string): Promise<GeoJsonCollection> {
  const url = `${base}${path}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  return parseCollection(await res.text());
}

const photonCache = new Map<string, { lat: number; lng: number } | null>();

async function photonFetchJson(query: string): Promise<Response> {
  return fetch(`https://photon.komoot.io/api?q=${encodeURIComponent(query)}&limit=1`);
}

async function photonGeocode(query: string): Promise<{ lat: number; lng: number } | null> {
  const key = query.trim().toLowerCase();
  if (photonCache.has(key)) return photonCache.get(key) ?? null;
  try {
    let res = await photonFetchJson(query);
    if (res.status === 429) {
      await new Promise((r) => setTimeout(r, 1300));
      res = await photonFetchJson(query);
    }
    if (!res.ok) {
      photonCache.set(key, null);
      return null;
    }
    const data = (await res.json()) as {
      features?: { geometry?: { coordinates?: number[] } }[];
    };
    const c = data.features?.[0]?.geometry?.coordinates;
    if (!c || c.length < 2) {
      photonCache.set(key, null);
      return null;
    }
    const pt = { lng: c[0], lat: c[1] };
    photonCache.set(key, pt);
    return pt;
  } catch {
    photonCache.set(key, null);
    return null;
  }
}

async function geocodeUniqueQueries(queries: string[]): Promise<void> {
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const q of queries) {
    const k = q.trim().toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    unique.push(q);
  }
  for (let i = 0; i < unique.length; i += PHOTON_BATCH) {
    const chunk = unique.slice(i, i + PHOTON_BATCH);
    await Promise.all(chunk.map((q) => photonGeocode(q)));
    if (i + PHOTON_BATCH < unique.length) {
      await new Promise((r) => setTimeout(r, PHOTON_BATCH_GAP_MS));
    }
  }
}

interface CkanDatastoreResponse {
  success: boolean;
  result?: {
    records: Record<string, unknown>[];
    total: number;
  };
}

async function fetchAllDatastoreRows(resourceId: string): Promise<Record<string, unknown>[]> {
  const base = dataZagrebBase();
  const rows: Record<string, unknown>[] = [];
  let offset = 0;
  const limit = 400;
  let pages = 0;
  const maxPages = 25;

  while (pages < maxPages) {
    pages += 1;
    const qs = new URLSearchParams({
      resource_id: resourceId,
      limit: String(limit),
      offset: String(offset),
    });
    let res = await fetch(`${base}/api/3/action/datastore_search?${qs.toString()}`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok && offset === 0) {
      res = await fetch(`${base}/api/3/action/datastore_search`, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ resource_id: resourceId, limit, offset }),
      });
    }
    if (!res.ok) throw new Error(`CKAN datastore: ${res.status}`);
    const json = (await res.json()) as CkanDatastoreResponse;
    if (!json.success || !json.result?.records) throw new Error("CKAN datastore: invalid response");
    const batch = json.result.records;
    rows.push(...batch);
    const total = Number(json.result.total ?? 0);
    if (batch.length === 0 || rows.length >= total) break;
    offset += limit;
  }
  return rows;
}

type ZeleniPrepared = {
  r: Record<string, unknown>;
  primary: string;
  fallback: string;
};

async function loadZeleniOtociFacilitiesInternal(): Promise<MapFacility[]> {
  const records = await fetchAllDatastoreRows(ZELENI_OTOCI_RESOURCE_ID);
  const prepared: ZeleniPrepared[] = [];
  for (const r of records) {
    const ulica = String(r.ULICA ?? "").trim();
    if (!ulica) continue;
    const opis = String(r["LOKACIJA (OPIS)"] ?? "").trim();
    const primary = opis ? `${ulica}, ${opis}, Zagreb, Croatia` : `${ulica}, Zagreb, Croatia`;
    const fallback = `${ulica}, Zagreb, Croatia`;
    prepared.push({ r, primary, fallback });
  }

  const toPrefetch = new Set<string>();
  for (const p of prepared) {
    toPrefetch.add(p.primary);
    if (p.primary.trim().toLowerCase() !== p.fallback.trim().toLowerCase()) {
      toPrefetch.add(p.fallback);
    }
  }
  await geocodeUniqueQueries([...toPrefetch]);

  const list: MapFacility[] = [];
  for (const { r, primary, fallback } of prepared) {
    let pt = await photonGeocode(primary);
    if (!pt && primary !== fallback) pt = await photonGeocode(fallback);
    if (!pt) continue;
    const ulica = String(r.ULICA ?? "").trim();
    const cetvrt = String(r["GRADSKA EETVRT"] ?? "").trim();
    const opis = String(r["LOKACIJA (OPIS)"] ?? "").trim();
    const rid = r._id ?? Math.random();
    const addressLine = [ulica, cetvrt].filter(Boolean).join(", ") || ulica;
    const name = opis ? `Zeleni otok — ${ulica} (${opis})` : `Zeleni otok — ${ulica}`;
    list.push({
      id: `zeleni-otok-${rid}`,
      kind: "green_island",
      name,
      address: addressLine,
      lat: pt.lat,
      lng: pt.lng,
      accepts: acceptsGreenIsland(),
      district: cetvrt || undefined,
      mayRequireResidentAccess: false,
    });
  }
  return list;
}

/** Single flight + cache: avoids duplicate Photon storms under React Strict Mode. */
export async function loadZeleniOtociFacilities(): Promise<MapFacility[]> {
  if (zeleniFacilitiesCache !== null) return zeleniFacilitiesCache;
  if (zeleniInflight) return zeleniInflight;
  zeleniInflight = loadZeleniOtociFacilitiesInternal()
    .then((list) => {
      zeleniFacilitiesCache = list;
      return list;
    })
    .finally(() => {
      zeleniInflight = null;
    });
  return zeleniInflight;
}

export function facilitiesFromPodzemni(fc: GeoJsonCollection): MapFacility[] {
  const list: MapFacility[] = [];
  for (const f of fc.features ?? []) {
    const pt = pointFromFeature(f);
    if (!pt) continue;
    const p = f.properties ?? {};
    const spremnik = cleanQuotes(p.Spremnik);
    const district = cleanQuotes(p.JMS_IME_1);
    const suffix = district ? ` · ${district}` : "";
    const name = spremnik ? `Podzemni spremnik — ${spremnik}${suffix}` : `Podzemni spremnik${suffix}`;
    const address = spremnik ? `${spremnik}, Zagreb` : district || "Zagreb";
    const oid = p.OBJECTID ?? f.id ?? Math.random();
    list.push({
      id: `podzemni-${oid}`,
      kind: "underground_bin",
      name,
      address,
      lat: pt.lat,
      lng: pt.lng,
      accepts: defaultBinAccepts(),
      district: district || undefined,
      mayRequireResidentAccess: true,
    });
  }
  return list;
}

export function facilitiesFromPolupodzemni(fc: GeoJsonCollection): MapFacility[] {
  const list: MapFacility[] = [];
  for (const f of fc.features ?? []) {
    const pt = pointFromFeature(f);
    if (!pt) continue;
    const p = f.properties ?? {};
    const district = cleanQuotes(p.JMS_IME_1);
    const area = cleanQuotes(p.JMS_IME);
    const line = firstAddressLine(p.adrese);
    const address = line || [district, area].filter(Boolean).join(", ") || "Zagreb";
    const label = line || [district, area].filter(Boolean).join(" — ") || "Polupodzemni spremnik";
    const oid = p.OBJECTID ?? f.id ?? Math.random();
    list.push({
      id: `polupodzemni-${oid}`,
      kind: "semi_underground_bin",
      name: `Polupodzemni spremnik — ${label}`,
      address,
      lat: pt.lat,
      lng: pt.lng,
      accepts: defaultBinAccepts(),
      district: district || area || undefined,
      mayRequireResidentAccess: true,
    });
  }
  return list;
}

export function facilitiesFromRecyclingYards(fc: GeoJsonCollection): MapFacility[] {
  const list: MapFacility[] = [];
  for (const f of fc.features ?? []) {
    const pt = pointFromFeature(f);
    if (!pt) continue;
    const p = f.properties ?? {};
    const naziv = cleanQuotes(p.NAZIV) || "Reciklažno dvorište";
    const addr = cleanQuotes(p.ADRESA_LOK) || cleanQuotes(p.ADRESA) || "Zagreb";
    const oid = p.OBJECTID_1 ?? p.OBJECTID ?? f.id ?? Math.random();
    list.push({
      id: `rd-${oid}`,
      kind: "recycling_yard",
      name: naziv.replace(/\r?\n/g, " ").trim(),
      address: addr.replace(/\r?\n/g, ", ").trim(),
      lat: pt.lat,
      lng: pt.lng,
      accepts: acceptsFromRecyclingYard(p),
      mayRequireResidentAccess: false,
    });
  }
  return list;
}

export interface ZagrebFacilitiesLoadResult {
  facilities: MapFacility[];
}

export async function loadAllZagrebFacilities(): Promise<ZagrebFacilitiesLoadResult> {
  const [podzemni, polu, rd] = await Promise.all([
    fetchGeoJson(PODZEMNI_GEOJSON, dataZagrebBase()),
    fetchGeoJson(POLUPODZEMNI_GEOJSON, dataZagrebBase()),
    fetchGeoJson(RECYCLING_YARDS_GEOJSON, arcgisBase()),
  ]);

  let zeleni: MapFacility[] = [];
  try {
    zeleni = await loadZeleniOtociFacilities();
  } catch (e) {
    console.warn("[zagrebOpenData] Zeleni otoci could not be loaded:", e);
  }

  const facilities = [
    ...zeleni,
    ...facilitiesFromPodzemni(podzemni),
    ...facilitiesFromPolupodzemni(polu),
    ...facilitiesFromRecyclingYards(rd),
  ];

  return { facilities };
}

type FacilityWithDist = MapFacility & { distanceKm: number };

/**
 * Up to `GREEN_ISLAND_NEAREST_TARGET` nearest zeleni otoci, then fills to `limit` with nearest
 * other types (preferring at least one yard / underground / semi when available).
 */
export function selectNearestWithGreenIslandsPriority(
  items: MapFacility[],
  originLat: number,
  originLng: number,
  limit: number,
): MapFacility[] {
  const withDist: FacilityWithDist[] = items.map((f) => ({
    ...f,
    distanceKm: haversineKm(originLat, originLng, f.lat, f.lng),
  }));

  const greens = withDist
    .filter((f) => f.kind === "green_island")
    .sort((a, b) => a.distanceKm - b.distanceKm);
  const nonGreens = withDist
    .filter((f) => f.kind !== "green_island")
    .sort((a, b) => a.distanceKm - b.distanceKm);

  const picked = new Map<string, FacilityWithDist>();
  const nGreen = Math.min(GREEN_ISLAND_NEAREST_TARGET, greens.length, limit);
  for (let i = 0; i < nGreen; i++) {
    picked.set(greens[i].id, greens[i]);
  }

  for (const kind of OTHER_KINDS_FOR_COVERAGE) {
    if (picked.size >= limit) break;
    const next = nonGreens.find((f) => f.kind === kind && !picked.has(f.id));
    if (next) picked.set(next.id, next);
  }

  for (const f of nonGreens) {
    if (picked.size >= limit) break;
    if (!picked.has(f.id)) picked.set(f.id, f);
  }

  return Array.from(picked.values()).sort((a, b) => a.distanceKm - b.distanceKm);
}
