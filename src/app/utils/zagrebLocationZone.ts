/**
 * Geolokacija + obrnuti geokod (Photon / OSM) za prikaz adrese i procjenu zone odvoza.
 * Čistoća nema javni API u pregledniku — točan raspored: cistoca.hr i aplikacija Razvrstaj MojZG.
 */

import { ZAGREB_ZONE_COUNT } from "./zagrebCollection";

export type LocationResolveOk = {
  ok: true;
  displayAddress: string;
  zone: number;
  /** Gradska četvrt / MO iz OSM-a, za prikaz */
  areaLabel: string | null;
  /** true ako nismo mapirali četvrt na zonu (zadrži ručni odabir ili 1) */
  zoneUncertain: boolean;
};

export type LocationResolveErr = {
  ok: false;
  reason: "not_zagreb" | "geocode_empty" | "network" | "permission_denied" | "position_unavailable" | "timeout";
};

export type LocationResolveResult = LocationResolveOk | LocationResolveErr;

/** Gruba pravokutna zona Grada Zagreba (WGS84). */
export function isRoughlyInZagrebBounds(lat: number, lon: number): boolean {
  return lat >= 45.72 && lat <= 45.92 && lon >= 15.84 && lon <= 16.22;
}

type PhotonProps = {
  type?: string;
  name?: string;
  street?: string;
  housenumber?: string;
  postcode?: string;
  district?: string;
  locality?: string;
  city?: string;
  countrycode?: string;
};

function foldDiacritics(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

/**
 * Heuristička mapa dijela grada → zona 1–4 (isti tjedni model kao u zagrebCollection).
 * Nije službeni podatak Čistoće.
 */
export function inferCollectionZoneFromArea(district?: string, locality?: string): number | null {
  const hay = foldDiacritics([district ?? "", locality ?? ""].join(" "));
  if (!hay.trim()) return null;

  if (/(tresnjevka|novi zagreb|brezovica)/.test(hay)) return 3;
  if (/(dubrava|maksimir|podsljeme|sesvet)/.test(hay)) return 2;
  if (/(cronomerec|podsused|vrapce|stenjevec)/.test(hay)) return 1;
  if (/(donji grad|gornji grad|medvescak|trnje|pescenica|zitnjak)/.test(hay)) return 4;

  return null;
}

function buildDisplayAddress(p: PhotonProps): string {
  const line1 =
    p.street != null && p.street !== ""
      ? p.housenumber
        ? `${p.street} ${p.housenumber}`
        : p.street
      : p.name && p.type === "house"
        ? p.name
        : "";
  const parts = [line1, p.district, p.locality, p.postcode, p.city].filter(
    (x): x is string => typeof x === "string" && x.trim() !== "",
  );
  const uniq: string[] = [];
  for (const part of parts) {
    if (!uniq.some((u) => u.toLowerCase() === part.toLowerCase())) uniq.push(part);
  }
  return uniq.join(", ");
}

function scorePhotonFeature(p: PhotonProps): number {
  let s = 0;
  if (p.street) s += 4;
  if (p.housenumber) s += 2;
  if (p.district) s += 3;
  if (p.locality) s += 1;
  if (p.postcode) s += 1;
  return s;
}

function pickBestPhotonProps(features: { properties?: PhotonProps }[]): PhotonProps | null {
  if (!features.length) return null;
  const hr = features.filter((f) => {
    const p = f.properties ?? {};
    if (p.countrycode !== "HR") return false;
    const city = (p.city ?? "").toLowerCase();
    return city.includes("zagreb") || city === "";
  });
  const pool = hr.length ? hr : features;
  let best: PhotonProps | null = null;
  let bestScore = -1;
  for (const f of pool) {
    const p = f.properties ?? {};
    const sc = scorePhotonFeature(p);
    if (sc > bestScore) {
      bestScore = sc;
      best = p;
    }
  }
  return best;
}

async function photonReverse(lat: number, lon: number): Promise<PhotonProps | null> {
  const url = `https://photon.komoot.io/reverse?lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(String(lon))}`;
  let res = await fetch(url);
  if (res.status === 429) {
    await new Promise((r) => setTimeout(r, 1300));
    res = await fetch(url);
  }
  if (!res.ok) return null;
  const data = (await res.json()) as { features?: { properties?: PhotonProps }[] };
  const props = pickBestPhotonProps(data.features ?? []);
  return props;
}

function cityIsZagreb(p: PhotonProps): boolean {
  const city = (p.city ?? "").toLowerCase();
  return city.includes("zagreb");
}

/**
 * Pretvara GPS u adresu (OSM) i preporučenu zonu za kalendar u aplikaciji.
 */
export async function resolveZagrebLocationForCalendar(
  lat: number,
  lon: number,
  fallbackZone: number,
): Promise<LocationResolveResult> {
  if (!isRoughlyInZagrebBounds(lat, lon)) {
    return { ok: false, reason: "not_zagreb" };
  }

  let props: PhotonProps | null;
  try {
    props = await photonReverse(lat, lon);
  } catch {
    return { ok: false, reason: "network" };
  }

  if (!props) return { ok: false, reason: "geocode_empty" };

  if (props.countrycode && props.countrycode !== "HR") {
    return { ok: false, reason: "not_zagreb" };
  }

  if (props.city && !cityIsZagreb(props)) {
    return { ok: false, reason: "not_zagreb" };
  }

  const displayAddress = buildDisplayAddress(props);
  if (!displayAddress) return { ok: false, reason: "geocode_empty" };

  const areaLabel = props.district?.trim() || props.locality?.trim() || null;
  const inferred = inferCollectionZoneFromArea(props.district, props.locality);
  const zoneUncertain = inferred == null;
  const zone = inferred ?? Math.min(Math.max(fallbackZone, 1), ZAGREB_ZONE_COUNT);

  return {
    ok: true,
    displayAddress,
    zone,
    areaLabel,
    zoneUncertain,
  };
}

export function geolocationErrorToReason(code: number): LocationResolveErr["reason"] {
  if (code === 1) return "permission_denied";
  if (code === 2) return "position_unavailable";
  if (code === 3) return "timeout";
  return "position_unavailable";
}
