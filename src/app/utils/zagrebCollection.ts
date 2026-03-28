/**
 * Ilustrativni tjedni raspored kućnog odvoza za Zagreb (Čistoća).
 * Stvarni dani ovise o četvrti i ulici — korisnik bira zonu 1–4 (pomaknuti uzorci).
 * Za točan raspored: https://www.cistoca.hr ili odvoz po adresi.
 */

import type { CollectionDay } from "./wasteData";

/** 0 = nedjelja … 6 = subota (kao Date.getDay()) */
const BASE_WEEK: Record<number, string[]> = {
  1: ["plastic", "bio"],
  2: ["paper"],
  3: ["glass", "bio"],
  4: ["plastic", "mixed"],
  5: ["paper", "bio"],
  6: ["mixed"],
  0: [],
};

export const ZAGREB_ZONE_COUNT = 4;

/** Kućni tokovi koje Čistoća najčešće skuplja od vrata (bez stakla/papira na zelenom otoku). */
export const CISTOCA_HOME_STREAM_IDS = ["bio", "plastic", "mixed"] as const;
export type CistocaHomeStreamId = (typeof CISTOCA_HOME_STREAM_IDS)[number];

export function getCategoriesForZagrebDate(date: Date, zone: number): string[] {
  const z = Math.min(Math.max(zone, 1), ZAGREB_ZONE_COUNT);
  const shift = z - 1;
  const dow = date.getDay();
  const sourceDow = (dow - shift + 7) % 7;
  const cats = BASE_WEEK[sourceDow];
  return cats ? [...cats] : [];
}

function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Sljedećih `days` dana od `start` (uključivo). */
export function getZagrebCollectionRange(
  start: Date,
  days: number,
  zone: number,
): CollectionDay[] {
  const out: CollectionDay[] = [];
  const d = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  for (let i = 0; i < days; i++) {
    const cur = new Date(d);
    cur.setDate(d.getDate() + i);
    out.push({
      date: toIsoDate(cur),
      categories: getCategoriesForZagrebDate(cur, zone),
    });
  }
  return out;
}

/**
 * Sljedeći datumi (ISO yyyy-mm-dd) kada za danu zonu pada odvoz `categoryId`, od `start` uključivo.
 */
export function getUpcomingPickupDatesForCategory(
  zone: number,
  categoryId: CistocaHomeStreamId,
  start: Date,
  lookaheadDays: number,
  maxDates: number,
): string[] {
  const range = getZagrebCollectionRange(start, lookaheadDays, zone);
  const out: string[] = [];
  for (const d of range) {
    if (d.categories.includes(categoryId)) {
      out.push(d.date);
      if (out.length >= maxDates) break;
    }
  }
  return out;
}

/** Svi dani u mjesecu (čak i bez odvoza — prazan categories). */
export function getZagrebMonthDays(year: number, monthIndex: number, zone: number): CollectionDay[] {
  const last = new Date(year, monthIndex + 1, 0).getDate();
  const out: CollectionDay[] = [];
  for (let day = 1; day <= last; day++) {
    const cur = new Date(year, monthIndex, day);
    out.push({
      date: toIsoDate(cur),
      categories: getCategoriesForZagrebDate(cur, zone),
    });
  }
  return out;
}

/** Prvi dan u mreži (0–6) i broj dana u mjesecu — za kalendar koji počinje nedjeljom. */
export function getMonthGridMeta(year: number, monthIndex: number): {
  firstDayDow: number;
  daysInMonth: number;
} {
  const first = new Date(year, monthIndex, 1);
  return {
    firstDayDow: first.getDay(),
    daysInMonth: new Date(year, monthIndex + 1, 0).getDate(),
  };
}
