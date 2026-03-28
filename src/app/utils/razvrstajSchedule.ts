/**
 * Službeni raspored odvoza (Grad Zagreb) — API kao na cistoca.hr / Razvrstaj MojZG.
 * @see https://razvrstajap.zagreb.hr
 */
import { getISOWeek } from "date-fns";
import { CALENDAR_CATEGORY_IDS, isCalendarCategory, type CalendarCategoryId } from "./zagrebCollection";
import type { CollectionDay } from "./wasteData";

const API_BASE = "https://razvrstajap.zagreb.hr";

type ApiOk<T> = { status: true; code: 200; data: T };
type ApiErr = { status?: false; code: number; error?: string };

function unwrap<T>(json: unknown): T {
  const o = json as ApiOk<T> & ApiErr;
  if (o && typeof o === "object" && "data" in o && o.data !== undefined && (o.status === true || o.code === 200)) {
    return o.data as T;
  }
  const err = (json as ApiErr)?.error ?? "Request failed";
  throw new Error(err);
}

export interface RazvrstajAddressHit {
  id: string;
  name: string;
  houseNumber: string;
  districtName: string;
  boardName: string;
}

export interface RazvrstajPickup {
  pickupId?: string;
  dayOfWeek: string;
  timeFrom: string | null;
  timeTo: string | null;
  repeat: string;
}

export interface RazvrstajScheduleRule {
  ruleId?: string;
  type: string;
  ruleType?: string;
  pickups: RazvrstajPickup[];
}

export interface RazvrstajAddressDetail {
  id: string;
  name?: string;
  houseNumber?: string;
  cityDistrictName?: string;
  districtName?: string;
  boardName?: string;
  schedules?: RazvrstajScheduleRule[];
}

/** API tip otpada → id u WASTE_CATEGORIES */
export function mapRazvrstajTypeToCategoryId(type: string): string | null {
  const t = type.toLowerCase().trim();
  const m: Record<string, string> = {
    bio: "bio",
    mjesoviti: "mixed",
    papir: "paper",
    plastika: "plastic",
    staklo: "glass",
  };
  return m[t] ?? null;
}

/** Plavi / žuti tjedan: koristimo parnost ISO tjedna (Čistoća izmjenjuje papir i plastiku). */
function weekMatchesRepeat(repeat: string, date: Date): boolean {
  const r = repeat.toUpperCase().trim();
  const w = getISOWeek(date);
  const odd = w % 2 === 1;
  switch (r) {
    case "EVERY WEEK":
      return true;
    case "BLUE WEEK":
      return odd;
    case "YELLOW WEEK":
      return !odd;
    default:
      return false;
  }
}

/** MON, TUE, … API ponekad šalje THR za četvrtak */
export function razvrstajDayOfWeekToJs(day: string): number | null {
  const d = day.toUpperCase().trim();
  const map: Record<string, number> = {
    SUN: 0,
    MON: 1,
    TUE: 2,
    WED: 3,
    THU: 4,
    THR: 4,
    FRI: 5,
    SAT: 6,
  };
  const n = map[d];
  return n === undefined ? null : n;
}

function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function pickupAppliesOnDate(pickup: RazvrstajPickup, date: Date): boolean {
  const dow = razvrstajDayOfWeekToJs(pickup.dayOfWeek);
  if (dow === null) return false;
  if (date.getDay() !== dow) return false;
  return weekMatchesRepeat(pickup.repeat, date);
}

/** Jedinstveni tipovi otpada iz rasporeda (samo kategorije prikazane u kalendaru). */
export function categoryIdsFromSchedules(schedules: RazvrstajScheduleRule[]): string[] {
  const set = new Set<string>();
  for (const rule of schedules) {
    const id = mapRazvrstajTypeToCategoryId(rule.type);
    if (id && isCalendarCategory(id)) set.add(id);
  }
  return [...set].sort(
    (a, b) =>
      CALENDAR_CATEGORY_IDS.indexOf(a as CalendarCategoryId) -
      CALENDAR_CATEGORY_IDS.indexOf(b as CalendarCategoryId),
  );
}

export function formatRazvrstajAddressLabel(row: RazvrstajAddressHit | RazvrstajAddressDetail): string {
  const street = row.name?.trim() ?? "";
  const num = "houseNumber" in row && row.houseNumber ? String(row.houseNumber).trim() : "";
  const dist =
    ("districtName" in row && row.districtName) ||
    ("cityDistrictName" in row && row.cityDistrictName) ||
    "";
  const line1 = [street, num].filter(Boolean).join(" ");
  return dist ? `${line1}, ${dist}` : line1 || street || num;
}

export async function searchRazvrstajAddresses(query: string): Promise<RazvrstajAddressHit[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const url = `${API_BASE}/addresses?${new URLSearchParams({ q })}`;
  const res = await fetch(url);
  const json: unknown = await res.json();
  const data = unwrap<RazvrstajAddressHit[]>(json);
  return Array.isArray(data) ? data : [];
}

export async function fetchRazvrstajAddressById(id: string): Promise<RazvrstajAddressDetail | null> {
  const url = `${API_BASE}/addresses/${encodeURIComponent(id)}`;
  const res = await fetch(url);
  const json: unknown = await res.json();
  const data = unwrap<RazvrstajAddressDetail[]>(json);
  const row = Array.isArray(data) ? data[0] : null;
  return row ?? null;
}

export function getRazvrstajCategoriesForDate(schedules: RazvrstajScheduleRule[], cur: Date): string[] {
  const cats = new Set<string>();
  for (const rule of schedules) {
    const catId = mapRazvrstajTypeToCategoryId(rule.type);
    if (!catId) continue;
    for (const p of rule.pickups ?? []) {
      if (pickupAppliesOnDate(p, cur) && isCalendarCategory(catId)) cats.add(catId);
    }
  }
  return [...cats];
}

export function getRazvrstajMonthDays(
  year: number,
  monthIndex: number,
  schedules: RazvrstajScheduleRule[],
): CollectionDay[] {
  const last = new Date(year, monthIndex + 1, 0).getDate();
  const out: CollectionDay[] = [];
  for (let day = 1; day <= last; day++) {
    const cur = new Date(year, monthIndex, day);
    out.push({ date: toIsoDate(cur), categories: getRazvrstajCategoriesForDate(schedules, cur) });
  }
  return out;
}

export function getRazvrstajUpcomingDatesForCategory(
  schedules: RazvrstajScheduleRule[],
  categoryId: string,
  start: Date,
  lookaheadDays: number,
  maxDates: number,
): string[] {
  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const out: string[] = [];
  for (let i = 0; i < lookaheadDays && out.length < maxDates; i++) {
    const cur = new Date(startDay);
    cur.setDate(startDay.getDate() + i);
    const cats = new Set<string>();
    for (const rule of schedules) {
      const cid = mapRazvrstajTypeToCategoryId(rule.type);
      if (cid !== categoryId) continue;
      for (const p of rule.pickups ?? []) {
        if (pickupAppliesOnDate(p, cur)) cats.add(cid);
      }
    }
    if (cats.has(categoryId)) out.push(toIsoDate(cur));
  }
  return out;
}
