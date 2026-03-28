import { Bell, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { BottomNavigation } from "../components/BottomNavigation";
import { useLocale } from "../context/LocaleContext";
import { formatStr, useUIStrings } from "../i18n/uiStrings";
import type { CollectionDay } from "../utils/wasteData";
import { getWasteCategory } from "../utils/wasteData";
import {
  geolocationErrorToReason,
  resolveZagrebLocationForCalendar,
  type LocationResolveErr,
} from "../utils/zagrebLocationZone";
import {
  getCategoriesForZagrebDate,
  getMonthGridMeta,
  getZagrebMonthDays,
  ZAGREB_ZONE_COUNT,
} from "../utils/zagrebCollection";
import {
  fetchRazvrstajAddressById,
  formatRazvrstajAddressLabel,
  getRazvrstajCategoriesForDate,
  getRazvrstajMonthDays,
  searchRazvrstajAddresses,
  type RazvrstajAddressHit,
  type RazvrstajScheduleRule,
} from "../utils/razvrstajSchedule";

const ZONE_STORAGE_KEY = "smechat-zagreb-zone";
const ADDRESS_STORAGE_KEY = "smechat-calendar-address";
const RAZVRSTAJ_ID_STORAGE_KEY = "smechat-razvrstaj-address-id";

function readStoredZone(): number {
  try {
    const s = localStorage.getItem(ZONE_STORAGE_KEY);
    const n = s ? parseInt(s, 10) : 1;
    if (n >= 1 && n <= ZAGREB_ZONE_COUNT) return n;
  } catch {
    /* ignore */
  }
  return 1;
}

function readStoredAddress(): string | null {
  try {
    const s = localStorage.getItem(ADDRESS_STORAGE_KEY);
    return s?.trim() ? s : null;
  } catch {
    return null;
  }
}

function readStoredRazvrstajId(): string | null {
  try {
    const s = localStorage.getItem(RAZVRSTAJ_ID_STORAGE_KEY);
    return s?.trim() ? s : null;
  } catch {
    return null;
  }
}

/** Ned–sub, usklađeno s redom dana u mreži kalendara. */
function weekDatesFromSundayContaining(ymd: string): Date[] {
  const [y, m, d] = ymd.split("-").map(Number);
  const local = new Date(y, m - 1, d);
  const dow = local.getDay();
  const start = new Date(local);
  start.setDate(local.getDate() - dow);
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(start);
    x.setDate(start.getDate() + i);
    return x;
  });
}

function toIsoDateLocal(d: Date): string {
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${mo}-${day}`;
}

function messageForLocationFailure(reason: LocationResolveErr["reason"], ui: ReturnType<typeof useUIStrings>): string {
  switch (reason) {
    case "permission_denied":
      return ui.calendar.locationErrDenied;
    case "position_unavailable":
      return ui.calendar.locationErrPosition;
    case "timeout":
      return ui.calendar.locationErrTimeout;
    case "network":
      return ui.calendar.locationErrNetwork;
    case "geocode_empty":
      return ui.calendar.locationErrGeocode;
    case "not_zagreb":
      return ui.calendar.locationErrNotZagreb;
    default:
      return ui.calendar.locationErrPosition;
  }
}

export function CalendarScreen() {
  const { locale, dateLocale } = useLocale();
  const ui = useUIStrings();

  const today = new Date();
  const [viewMonthStart, setViewMonthStart] = useState(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), 1);
  });
  const [zone, setZone] = useState(readStoredZone);
  const [savedAddress, setSavedAddress] = useState<string | null>(readStoredAddress);
  const [resolvedAreaLabel, setResolvedAreaLabel] = useState<string | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);
  const [zoneUncertain, setZoneUncertain] = useState(false);

  const [addressQuery, setAddressQuery] = useState("");
  const [addressHits, setAddressHits] = useState<RazvrstajAddressHit[]>([]);
  const [addressSearchLoading, setAddressSearchLoading] = useState(false);
  const [razvrstajAddressId, setRazvrstajAddressId] = useState<string | null>(readStoredRazvrstajId);
  const [razvrstajSchedules, setRazvrstajSchedules] = useState<RazvrstajScheduleRule[] | null>(null);
  const [officialScheduleLoading, setOfficialScheduleLoading] = useState(() => !!readStoredRazvrstajId());
  const [officialFetchError, setOfficialFetchError] = useState<string | null>(null);

  useEffect(() => {
    const id = readStoredRazvrstajId();
    if (!id) {
      setOfficialScheduleLoading(false);
      return;
    }
    let cancel = false;
    setOfficialScheduleLoading(true);
    (async () => {
      try {
        const row = await fetchRazvrstajAddressById(id);
        if (cancel) return;
        if (!row?.schedules?.length) {
          try {
            localStorage.removeItem(RAZVRSTAJ_ID_STORAGE_KEY);
          } catch {
            /* ignore */
          }
          setRazvrstajAddressId(null);
          setRazvrstajSchedules(null);
          return;
        }
        setRazvrstajAddressId(id);
        setRazvrstajSchedules(row.schedules);
        setSavedAddress(formatRazvrstajAddressLabel(row));
      } catch {
        if (!cancel) {
          try {
            localStorage.removeItem(RAZVRSTAJ_ID_STORAGE_KEY);
          } catch {
            /* ignore */
          }
          setRazvrstajAddressId(null);
          setRazvrstajSchedules(null);
        }
      } finally {
        if (!cancel) setOfficialScheduleLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(ZONE_STORAGE_KEY, String(zone));
    } catch {
      /* ignore */
    }
  }, [zone]);

  useEffect(() => {
    if (!savedAddress) return;
    try {
      localStorage.setItem(ADDRESS_STORAGE_KEY, savedAddress);
    } catch {
      /* ignore */
    }
  }, [savedAddress]);

  useEffect(() => {
    try {
      if (!razvrstajAddressId) localStorage.removeItem(RAZVRSTAJ_ID_STORAGE_KEY);
      else localStorage.setItem(RAZVRSTAJ_ID_STORAGE_KEY, razvrstajAddressId);
    } catch {
      /* ignore */
    }
  }, [razvrstajAddressId]);

  useEffect(() => {
    const q = addressQuery.trim();
    if (q.length < 2) {
      setAddressHits([]);
      return;
    }
    const t = window.setTimeout(() => {
      (async () => {
        setAddressSearchLoading(true);
        try {
          const hits = await searchRazvrstajAddresses(q);
          setAddressHits(hits.slice(0, 14));
        } catch {
          setAddressHits([]);
        } finally {
          setAddressSearchLoading(false);
        }
      })();
    }, 380);
    return () => window.clearTimeout(t);
  }, [addressQuery]);

  const clearOfficialAddress = () => {
    setRazvrstajAddressId(null);
    setRazvrstajSchedules(null);
    setOfficialFetchError(null);
    setAddressQuery("");
    setAddressHits([]);
    try {
      localStorage.removeItem(RAZVRSTAJ_ID_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  };

  const selectRazvrstajHit = async (hit: RazvrstajAddressHit) => {
    setOfficialFetchError(null);
    setOfficialScheduleLoading(true);
    setAddressQuery("");
    setAddressHits([]);
    try {
      const row = await fetchRazvrstajAddressById(hit.id);
      if (!row?.schedules?.length) {
        setOfficialFetchError(ui.calendar.addressFetchError);
        return;
      }
      setRazvrstajAddressId(hit.id);
      setRazvrstajSchedules(row.schedules);
      setSavedAddress(formatRazvrstajAddressLabel(row));
      setZoneUncertain(false);
      setResolvedAreaLabel(row.cityDistrictName ?? row.districtName ?? hit.districtName ?? null);
    } catch {
      setOfficialFetchError(ui.calendar.addressFetchError);
    } finally {
      setOfficialScheduleLoading(false);
    }
  };

  const useMyLocation = () => {
    setLocError(null);
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocError(ui.calendar.locationNoBrowser);
      return;
    }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const res = await resolveZagrebLocationForCalendar(
          pos.coords.latitude,
          pos.coords.longitude,
          zone,
        );
        setLocLoading(false);
        if (!res.ok) {
          setLocError(messageForLocationFailure(res.reason, ui));
          return;
        }
        setRazvrstajAddressId(null);
        setRazvrstajSchedules(null);
        try {
          localStorage.removeItem(RAZVRSTAJ_ID_STORAGE_KEY);
        } catch {
          /* ignore */
        }
        setSavedAddress(res.displayAddress);
        setResolvedAreaLabel(res.areaLabel);
        setZone(res.zone);
        setZoneUncertain(res.zoneUncertain);
      },
      (err) => {
        setLocLoading(false);
        setLocError(messageForLocationFailure(geolocationErrorToReason(err.code), ui));
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 60_000 },
    );
  };

  const year = viewMonthStart.getFullYear();
  const monthIndex = viewMonthStart.getMonth();
  const monthTitle = viewMonthStart.toLocaleDateString(dateLocale, {
    month: "long",
    year: "numeric",
  });

  const { firstDayDow } = useMemo(() => getMonthGridMeta(year, monthIndex), [year, monthIndex]);

  const monthDays = useMemo(() => {
    if (razvrstajSchedules?.length) {
      return getRazvrstajMonthDays(year, monthIndex, razvrstajSchedules);
    }
    return getZagrebMonthDays(year, monthIndex, zone);
  }, [year, monthIndex, zone, razvrstajSchedules]);

  const todayYmd = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const listWeekDays = useMemo(() => {
    const dates = weekDatesFromSundayContaining(todayYmd);
    return dates
      .map((d) => {
        const categories = razvrstajSchedules?.length
          ? getRazvrstajCategoriesForDate(razvrstajSchedules, d)
          : getCategoriesForZagrebDate(d, zone);
        return { date: toIsoDateLocal(d), categories };
      })
      .filter((row) => row.categories.length > 0);
  }, [todayYmd, razvrstajSchedules, zone]);

  const goPrevMonth = () => {
    setViewMonthStart((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  };

  const goNextMonth = () => {
    setViewMonthStart((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  };

  const gridCells: (CollectionDay | null)[] = useMemo(() => {
    const cells: (CollectionDay | null)[] = [];
    for (let i = 0; i < firstDayDow; i++) cells.push(null);
    monthDays.forEach((day) => cells.push(day));
    return cells;
  }, [firstDayDow, monthDays]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-green-50 pb-20">
      <div className="bg-white shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">{ui.calendar.title}</h1>
          <p className="text-sm text-gray-600 mt-1">{ui.calendar.subtitle}</p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-md p-4 mb-4 border border-gray-100">
          <h3 className="text-sm font-bold text-gray-900">{ui.calendar.scheduleByAddressTitle}</h3>
          <p className="text-xs text-gray-600 mt-1 leading-relaxed">{ui.calendar.scheduleByAddressSubtitle}</p>
          <label className="block text-xs font-semibold text-gray-500 mt-3 mb-1" htmlFor="razvrstaj-q">
            {ui.calendar.addressSearchLabel}
          </label>
          <input
            id="razvrstaj-q"
            type="search"
            autoComplete="street-address"
            value={addressQuery}
            onChange={(e) => setAddressQuery(e.target.value)}
            placeholder={ui.calendar.addressSearchPlaceholder}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400"
          />
          {addressSearchLoading ? (
            <p className="text-xs text-gray-500 mt-2">{ui.calendar.addressSearchLoading}</p>
          ) : null}
          {officialFetchError ? (
            <p className="text-xs text-red-600 mt-2" role="alert">
              {officialFetchError}
            </p>
          ) : null}
          {addressQuery.trim().length >= 2 && !addressSearchLoading && addressHits.length === 0 ? (
            <p className="text-xs text-gray-500 mt-2">{ui.calendar.addressHitsEmpty}</p>
          ) : null}
          {addressHits.length > 0 ? (
            <ul className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-gray-100 divide-y divide-gray-100 bg-white">
              {addressHits.map((hit) => (
                <li key={hit.id}>
                  <button
                    type="button"
                    disabled={officialScheduleLoading}
                    onClick={() => selectRazvrstajHit(hit)}
                    className="w-full text-left px-3 py-2.5 text-sm text-gray-900 hover:bg-green-50 disabled:opacity-50"
                  >
                    {formatRazvrstajAddressLabel(hit)}
                    <span className="block text-[10px] text-gray-500 mt-0.5">{hit.boardName}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          {razvrstajAddressId ? (
            <button
              type="button"
              onClick={clearOfficialAddress}
              className="mt-3 text-xs font-semibold text-gray-600 underline hover:text-gray-900"
            >
              {ui.calendar.clearOfficialAddress}
            </button>
          ) : null}
        </div>

        <div className="bg-white rounded-2xl shadow-md p-4 mb-4">
          <button
            type="button"
            onClick={useMyLocation}
            disabled={locLoading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-green-600 text-white font-semibold py-3 px-4 text-sm hover:bg-green-700 disabled:opacity-60 disabled:pointer-events-none"
          >
            <MapPin className="w-5 h-5 shrink-0" />
            {locLoading ? ui.calendar.locating : ui.calendar.useMyLocation}
          </button>
          {locError && (
            <p className="text-xs text-red-600 mt-2" role="alert">
              {locError}
            </p>
          )}
          {savedAddress && (
            <div className="mt-3 rounded-xl bg-gray-50 border border-gray-100 p-3">
              <p className="text-[10px] font-semibold text-gray-500 uppercase">{ui.calendar.yourAddress}</p>
              <p className="text-sm text-gray-900 mt-0.5 leading-snug">{savedAddress}</p>
              {resolvedAreaLabel && (
                <p className="text-xs text-gray-600 mt-2">
                  {formatStr(ui.calendar.zoneEstimateLine, {
                    n: zone,
                    area: resolvedAreaLabel,
                  })}
                </p>
              )}
            </div>
          )}
          {zoneUncertain && !locError && (
            <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg p-2 mt-2">
              {ui.calendar.zoneUncertainHint}
            </p>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-md p-4 mb-4">
          {officialScheduleLoading ? (
            <p className="text-xs text-gray-600 mb-3">{ui.calendar.officialScheduleLoading}</p>
          ) : null}
          <label className="block text-xs font-semibold text-gray-500 mb-1" htmlFor="zagreb-zone">
            {ui.calendar.zoneLabel}
            {razvrstajSchedules?.length ? (
              <span className="block font-normal text-[10px] text-gray-400 mt-0.5 normal-case">
                {ui.calendar.zoneIgnoredWhenOfficial}
              </span>
            ) : null}
          </label>
          <select
            id="zagreb-zone"
            value={zone}
            disabled={!!razvrstajSchedules?.length}
            onChange={(e) => {
              setZoneUncertain(false);
              setResolvedAreaLabel(null);
              setZone(Number(e.target.value));
            }}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 disabled:opacity-50"
          >
            {Array.from({ length: ZAGREB_ZONE_COUNT }, (_, i) => i + 1).map((z) => (
              <option key={z} value={z}>
                {formatStr(ui.calendar.zoneOption, { n: z })}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={goPrevMonth}
              className="p-2 hover:bg-gray-100 rounded-lg"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h2 className="font-bold text-lg text-gray-900 capitalize">{monthTitle}</h2>
            <button
              type="button"
              onClick={goNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg"
              aria-label="Next month"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {ui.calendar.weekdays.map((day) => (
              <div key={day} className="text-center text-[10px] font-semibold text-gray-500 py-1">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {gridCells.map((cell, idx) => {
              if (!cell) {
                return <div key={`pad-${idx}`} className="aspect-square min-h-[3rem]" />;
              }
              const isTodayCell = cell.date === todayYmd;
              const dom = new Date(cell.date + "T12:00:00").getDate();
              return (
                <div
                  key={cell.date}
                  className={`aspect-square min-h-[3rem] rounded-lg border flex flex-col items-center justify-start pt-1 px-0.5 ${
                    isTodayCell ? "border-green-500 bg-green-50 ring-1 ring-green-400" : "border-gray-100 bg-gray-50/80"
                  }`}
                >
                  <span
                    className={`text-xs font-semibold ${isTodayCell ? "text-green-800" : "text-gray-800"}`}
                  >
                    {dom}
                  </span>
                  <div className="flex flex-wrap gap-0.5 justify-center mt-0.5 max-w-full">
                    {cell.categories.map((categoryId) => {
                      const cat = getWasteCategory(categoryId, locale);
                      if (!cat) return null;
                      return (
                        <span
                          key={categoryId}
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: cat.binColorHex }}
                          title={cat.name}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <h3 className="text-sm font-semibold text-gray-800 mb-2 px-1">{ui.calendar.listTitle}</h3>
        <div className="space-y-3">
          {listWeekDays.length === 0 ? (
            <p className="text-sm text-gray-500 px-1 py-2">{ui.calendar.listWeekEmpty}</p>
          ) : null}
          {listWeekDays.map((day, index) => {
            const date = new Date(day.date + "T12:00:00");
            const dayName = date.toLocaleDateString(dateLocale, { weekday: "long" });
            const dayNumber = date.getDate();
            const monthShort = date.toLocaleDateString(dateLocale, { month: "short" });
            const dayWeekShort = date.toLocaleDateString(dateLocale, { weekday: "short" });
            const isToday = day.date === todayYmd;
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            const tomorrowYmd = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;
            const isTomorrow = day.date === tomorrowYmd;

            return (
              <motion.div
                key={day.date}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.04 }}
                className={`bg-white rounded-2xl shadow-md p-4 ${isToday ? "ring-2 ring-green-500" : ""}`}
              >
                <div className="flex gap-4">
                  <div
                    className={`flex-shrink-0 w-16 text-center ${
                      isToday ? "bg-green-500 text-white" : "bg-gray-100 text-gray-900"
                    } rounded-xl p-2`}
                  >
                    <div className="text-xs font-semibold">{monthShort}</div>
                    <div className="text-2xl font-bold">{dayNumber}</div>
                    <div className="text-xs capitalize">{dayWeekShort}</div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900">
                        {isToday
                          ? ui.calendar.today
                          : isTomorrow
                            ? ui.calendar.tomorrow
                            : dayName}
                      </h3>
                      {isToday && (
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                          {ui.calendar.todayBadge}
                        </span>
                      )}
                      {isTomorrow && <Bell className="w-4 h-4 text-yellow-500" />}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {day.categories.map((categoryId) => {
                        const cat = getWasteCategory(categoryId, locale);
                        if (!cat) return null;
                        return (
                          <div
                            key={categoryId}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                            style={{
                              backgroundColor: cat.binColorHex + "20",
                            }}
                          >
                            <div
                              className="w-3 h-3 rounded-full shrink-0"
                              style={{ backgroundColor: cat.binColorHex }}
                            />
                            <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl shadow-lg p-6 text-white"
        >
          <div className="flex items-start gap-3">
            <Bell className="w-6 h-6 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold mb-1">{ui.calendar.remindersTitle}</h3>
              <p className="text-sm opacity-90 mb-3">{ui.calendar.remindersText}</p>
              <button
                type="button"
                className="bg-white text-orange-600 font-semibold px-4 py-2 rounded-lg text-sm hover:bg-opacity-90 transition-colors"
              >
                {ui.calendar.remindersBtn}
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      <BottomNavigation />
    </div>
  );
}
