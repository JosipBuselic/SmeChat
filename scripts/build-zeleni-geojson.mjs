/**
 * One-off / maintenance: reads scripts/data/zeleniotoci.csv (CP1250),
 * geocodes each row via Photon, writes public/data/zeleni-otoci.geojson.
 *
 * Run: npm run build:zeleni
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import iconv from "iconv-lite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const csvPath = path.join(__dirname, "data", "zeleniotoci.csv");
const outPath = path.join(__dirname, "..", "public", "data", "zeleni-otoci.geojson");

const PHOTON_BATCH = 4;
const PHOTON_BATCH_GAP_MS = 220;

/** Reject obvious Photon mismatches (e.g. same street name elsewhere in HR). */
function inZagrebMetro(lat, lng) {
  return lat >= 45.62 && lat <= 46.12 && lng >= 15.72 && lng <= 16.55;
}

const cache = new Map();

async function photonGeocode(query) {
  const key = query.trim().toLowerCase();
  if (cache.has(key)) return cache.get(key) ?? null;
  try {
    let res = await fetch(`https://photon.komoot.io/api?q=${encodeURIComponent(query)}&limit=1`);
    if (res.status === 429) {
      await new Promise((r) => setTimeout(r, 1300));
      res = await fetch(`https://photon.komoot.io/api?q=${encodeURIComponent(query)}&limit=1`);
    }
    if (!res.ok) {
      cache.set(key, null);
      return null;
    }
    const data = await res.json();
    const c = data.features?.[0]?.geometry?.coordinates;
    if (!c || c.length < 2) {
      cache.set(key, null);
      return null;
    }
    const pt = { lng: c[0], lat: c[1] };
    cache.set(key, pt);
    return pt;
  } catch {
    cache.set(key, null);
    return null;
  }
}

async function geocodeUniqueQueries(queries) {
  const seen = new Set();
  const unique = [];
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

function parseCsvLine(line) {
  const parts = line.split(";");
  return {
    ulica: (parts[0] ?? "").trim(),
    opis: (parts[1] ?? "").trim(),
    cetvrt: (parts[2] ?? "").trim(),
  };
}

const buf = fs.readFileSync(csvPath);
const text = iconv.decode(buf, "windows-1250");
const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
if (lines.length < 2) {
  console.error("CSV empty or missing data rows");
  process.exit(1);
}

const rows = [];
const toPrefetch = new Set();

for (let i = 1; i < lines.length; i++) {
  const { ulica, opis, cetvrt } = parseCsvLine(lines[i]);
  let primary;
  let fallback;
  if (ulica) {
    primary = opis ? `${ulica}, ${opis}, Zagreb, Croatia` : `${ulica}, Zagreb, Croatia`;
    fallback = `${ulica}, Zagreb, Croatia`;
  } else if (cetvrt) {
    primary = `${cetvrt}, Zagreb, Croatia`;
    fallback = primary;
  } else {
    console.warn(`Skip row ${i + 1}: no street or district`);
    continue;
  }
  rows.push({ rowIndex: i + 1, ulica, opis, cetvrt, primary, fallback });
  toPrefetch.add(primary);
  if (primary.trim().toLowerCase() !== fallback.trim().toLowerCase()) {
    toPrefetch.add(fallback);
  }
}

console.log(`Geocoding ${toPrefetch.size} unique queries for ${rows.length} rows…`);
await geocodeUniqueQueries([...toPrefetch]);

const features = [];
for (const { rowIndex, ulica, opis, cetvrt, primary, fallback } of rows) {
  let pt = await photonGeocode(primary);
  if (!pt && primary !== fallback) pt = await photonGeocode(fallback);
  if (pt && !inZagrebMetro(pt.lat, pt.lng)) {
    const tertiary = ulica ? `${ulica}, Zagreb, Hrvatska` : `${cetvrt}, Zagreb, Hrvatska`;
    const alt = await photonGeocode(tertiary);
    if (alt && inZagrebMetro(alt.lat, alt.lng)) pt = alt;
    else pt = null;
  }
  if (!pt) {
    console.warn(`No coordinates row ${rowIndex}: ${primary}`);
    continue;
  }
  features.push({
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [pt.lng, pt.lat],
    },
    properties: {
      _sourceRow: rowIndex,
      ULICA: ulica,
      "LOKACIJA (OPIS)": opis,
      /** Matches CKAN field name used in zagrebOpenData (publisher typo). */
      "GRADSKA EETVRT": cetvrt,
    },
  });
}

fs.mkdirSync(path.dirname(outPath), { recursive: true });
const fc = { type: "FeatureCollection", features };
fs.writeFileSync(outPath, JSON.stringify(fc), "utf8");
console.log(`Wrote ${outPath} (${features.length} features, ${rows.length - features.length} misses)`);
