import { Bell, ChevronLeft, ChevronRight, ExternalLink, MapPin } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { BottomNavigation } from "../components/BottomNavigation";
import { useLocale } from "../context/LocaleContext";
import { formatStr, useUIStrings } from "../i18n/uiStrings";
import type { CollectionDay } from "../utils/wasteData";
import { getWasteCategory, WASTE_CATEGORIES } from "../utils/wasteData";
import {
  geolocationErrorToReason,
  resolveZagrebLocationForCalendar,
  type LocationResolveErr,
} from "../utils/zagrebLocationZone";
import {
  CISTOCA_HOME_STREAM_IDS,
  getMonthGridMeta,
  getUpcomingPickupDatesForCategory,
  getZagrebMonthDays,
  ZAGREB_ZONE_COUNT,
} from "../utils/zagrebCollection";

const ZONE_STORAGE_KEY = "smechat-zagreb-zone";
const ADDRESS_STORAGE_KEY = "smechat-calendar-address";

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

  const monthDays = useMemo(
    () => getZagrebMonthDays(year, monthIndex, zone),
    [year, monthIndex, zone],
  );

  const listDays = useMemo(
    () => monthDays.filter((d) => d.categories.length > 0),
    [monthDays],
  );

  const todayYmd = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const categoryIds = Object.keys(WASTE_CATEGORIES);

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

  const streamPickupsByCategory = useMemo(() => {
    if (!savedAddress) return null;
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const lookaheadDays = 120;
    const maxDates = 12;
    return {
      bio: getUpcomingPickupDatesForCategory(zone, "bio", start, lookaheadDays, maxDates),
      plastic: getUpcomingPickupDatesForCategory(zone, "plastic", start, lookaheadDays, maxDates),
      mixed: getUpcomingPickupDatesForCategory(zone, "mixed", start, lookaheadDays, maxDates),
    };
  }, [savedAddress, zone, todayYmd]);

  const formatStreamDate = (iso: string) =>
    new Date(`${iso}T12:00:00`).toLocaleDateString(dateLocale, {
      weekday: "short",
      day: "numeric",
      month: "short",
    });

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-green-50 pb-20">
      <div className="bg-white shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">{ui.calendar.title}</h1>
          <p className="text-sm text-gray-600 mt-1">{ui.calendar.subtitle}</p>
          <p className="text-xs text-amber-800/90 mt-2 leading-relaxed">{ui.calendar.disclaimer}</p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-md p-4 mb-4 border border-gray-100">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            {ui.calendar.officialLinksTitle}
          </h3>
          <div className="flex flex-col gap-2">
            <a
              href={ui.calendar.cistocaWasteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-900"
            >
              <ExternalLink className="w-4 h-4 shrink-0" />
              {ui.calendar.linkCistoca}
            </a>
            <a
              href={ui.calendar.razvrstajUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-900"
            >
              <ExternalLink className="w-4 h-4 shrink-0" />
              {ui.calendar.linkRazvrstaj}
            </a>
            <a
              href={ui.calendar.mojOtpadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-900"
            >
              <ExternalLink className="w-4 h-4 shrink-0" />
              {ui.calendar.linkMojOtpad}
            </a>
          </div>
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
          <p className="text-[11px] text-gray-500 mt-2 leading-relaxed">{ui.calendar.photonNote}</p>
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

        {savedAddress && streamPickupsByCategory && (
          <div className="bg-white rounded-2xl shadow-md p-4 mb-4 border border-emerald-200/80">
            <h3 className="text-sm font-bold text-gray-900">{ui.calendar.cistocaStreamsTitle}</h3>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">{ui.calendar.cistocaStreamsSubtitle}</p>
            <div className="mt-4 space-y-4">
              {CISTOCA_HOME_STREAM_IDS.map((streamId) => {
                const cat = getWasteCategory(streamId, locale);
                const dates = streamPickupsByCategory[streamId];
                if (!cat) return null;
                return (
                  <div key={streamId} className="rounded-xl border border-gray-100 bg-gray-50/90 p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0 ring-2 ring-white shadow-sm"
                        style={{ backgroundColor: cat.binColorHex }}
                      />
                      <span className="text-sm font-semibold text-gray-900">{cat.name}</span>
                    </div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
                      {ui.calendar.streamNextPickups}
                    </p>
                    {dates.length === 0 ? (
                      <p className="text-xs text-gray-500">{ui.calendar.streamNoDates}</p>
                    ) : (
                      <ul className="flex flex-wrap gap-1.5">
                        {dates.map((iso) => (
                          <li
                            key={iso}
                            className={`text-xs font-medium rounded-lg px-2 py-1 capitalize border ${
                              iso === todayYmd
                                ? "bg-green-50 border-green-400 text-green-900 ring-1 ring-green-300"
                                : "text-gray-800 bg-white border-gray-200"
                            }`}
                          >
                            {formatStreamDate(iso)}
                            {iso === todayYmd ? ` · ${ui.calendar.todayBadge}` : ""}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-md p-4 mb-4">
          <label className="block text-xs font-semibold text-gray-500 mb-1" htmlFor="zagreb-zone">
            {ui.calendar.zoneLabel}
          </label>
          <select
            id="zagreb-zone"
            value={zone}
            onChange={(e) => {
              setZoneUncertain(false);
              setResolvedAreaLabel(null);
              setZone(Number(e.target.value));
            }}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900"
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
          {listDays.map((day, index) => {
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

        <div className="mt-6 bg-white rounded-2xl shadow-sm p-4">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm">{ui.calendar.legendTitle}</h3>
          <div className="space-y-2">
            {categoryIds.map((id) => {
              const category = getWasteCategory(id, locale);
              if (!category) return null;
              return (
                <div key={category.id} className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full shrink-0"
                    style={{ backgroundColor: category.binColorHex }}
                  />
                  <span className="text-sm text-gray-700">{category.name}</span>
                  <span className="text-xs text-gray-500 ml-auto text-right">{category.binColor}</span>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-500 mt-3 leading-relaxed">{ui.calendar.legendDoorNote}</p>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}
