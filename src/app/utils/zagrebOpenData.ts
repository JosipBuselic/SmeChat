/**
 * Loads data from data.zagreb.hr (GeoJSON), static zeleni otoci (public/data/zeleni-otoci.geojson),
 * and recycling yards (ArcGIS).
 * Regenerate zeleni GeoJSON: `npm run build:zeleni` (see scripts/build-zeleni-geojson.mjs).
 * Dev: `vite.config` proxies `/api/zagreb-proxy` and `/api/arcgis-proxy` (query `p=` = upstream path).
 * Prod: `/api/zagreb-proxy` and `/api/arcgis-proxy` (Vercel serverless) fetch upstream server-side — no browser CORS.
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

/** Built from scripts/data/zeleniotoci.csv via `npm run build:zeleni` */
const ZELENI_OTOCI_GEOJSON = "/data/zeleni-otoci.geojson";

function dataZagrebBase(): string {
  return "/api/zagreb-proxy";
}

function arcgisBase(): string {
  return "/api/arcgis-proxy";
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
  const url = `${base}?p=${encodeURIComponent(path)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  return parseCollection(await res.text());
}

async function fetchZeleniOtociGeoJson(): Promise<GeoJsonCollection> {
  const url = ZELENI_OTOCI_GEOJSON;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  return parseCollection(await res.text());
}

export function facilitiesFromZeleniOtociGeoJson(fc: GeoJsonCollection): MapFacility[] {
  const list: MapFacility[] = [];
  for (const f of fc.features ?? []) {
    const pt = pointFromFeature(f);
    if (!pt) continue;
    const p = f.properties ?? {};
    const ulica = String(p.ULICA ?? "").trim();
    const cetvrt = String(p["GRADSKA EETVRT"] ?? "").trim();
    const opis = String(p["LOKACIJA (OPIS)"] ?? "").trim();
    const row = p._sourceRow;
    const rid = row != null && row !== "" ? String(row) : (f.id != null ? String(f.id) : Math.random());
    const addressLine = [ulica, cetvrt].filter(Boolean).join(", ") || ulica || cetvrt || "Zagreb";
    const name = ulica
      ? opis
        ? `Zeleni otok — ${ulica} (${opis})`
        : `Zeleni otok — ${ulica}`
      : opis
        ? `Zeleni otok — ${opis}`
        : `Zeleni otok — ${cetvrt || "Zagreb"}`;
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

async function loadZeleniOtociFacilitiesInternal(): Promise<MapFacility[]> {
  const fc = await fetchZeleniOtociGeoJson();
  return facilitiesFromZeleniOtociGeoJson(fc);
}

/** Single flight + cache: avoids duplicate fetches under React Strict Mode. */
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
