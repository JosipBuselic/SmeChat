import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Leaf, Loader2, Navigation, Recycle, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { BottomNavigation } from "../components/BottomNavigation";
import { USER_LOCATION_MARKER, ZagrebFacilitiesMap } from "../components/ZagrebFacilitiesMap";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { useLocale } from "../context/LocaleContext";
import { useUIStrings } from "../i18n/uiStrings";
import { getWasteCategory } from "../utils/wasteData";
import {
  loadAllZagrebFacilities,
  MAX_DISPLAYED_FACILITIES,
  selectNearestWithGreenIslandsPriority,
  type MapFacility,
  ZAGREB_CENTER,
} from "../utils/zagrebOpenData";

function requestUserLocation(options?: { maximumAge?: number }): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15_000,
      maximumAge: options?.maximumAge ?? 60_000,
    });
  });
}

function openDirections(f: MapFacility) {
  const q = `${f.lat},${f.lng}`;
  window.open(`https://www.google.com/maps?q=${encodeURIComponent(q)}`, "_blank", "noopener,noreferrer");
}

export function MapScreen() {
  const { locale } = useLocale();
  const ui = useUIStrings();
  const m = ui.map;
  const mapBasemapSuffix = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim()
    ? m.googleMapsSuffix
    : m.osmSuffix;

  const [allFacilities, setAllFacilities] = useState<MapFacility[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [geoWorking, setGeoWorking] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<MapFacility | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingData(true);
      setLoadError(null);
      try {
        const { facilities } = await loadAllZagrebFacilities();
        if (cancelled) return;
        setAllFacilities(facilities);
      } catch (e) {
        if (cancelled) return;
        setLoadError(e instanceof Error ? e.message : m.loadErrorGeneric);
        setAllFacilities([]);
      } finally {
        if (!cancelled) setLoadingData(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const pos = await requestUserLocation();
        if (!cancelled) {
          setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        }
      } catch {
        /* city center until Near me */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const sortOrigin = userPos ?? ZAGREB_CENTER;

  const displayed = useMemo(
    () =>
      selectNearestWithGreenIslandsPriority(
        allFacilities,
        sortOrigin.lat,
        sortOrigin.lng,
        MAX_DISPLAYED_FACILITIES,
      ),
    [allFacilities, sortOrigin.lat, sortOrigin.lng],
  );

  useEffect(() => {
    if (displayed.length === 0) return;
    setSelectedLocation((prev) => {
      if (prev && displayed.some((d) => d.id === prev.id)) return prev;
      return displayed[0];
    });
  }, [displayed]);

  async function onNearMe() {
    setGeoWorking(true);
    try {
      const pos = await requestUserLocation({ maximumAge: 0 });
      setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      toast.success(m.toastNearMeOk);
    } catch {
      toast.error(m.toastNearMeFail);
    } finally {
      setGeoWorking(false);
    }
  }

  const showContainerAccessWarning = displayed.some((f) => f.mayRequireResidentAccess);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">{m.title}</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-4 space-y-3">
        {loadError && (
          <Alert variant="destructive" className="border-red-200 bg-red-50">
            <AlertTitle>{m.loadErrorTitle}</AlertTitle>
            <AlertDescription className="text-red-800">{loadError}</AlertDescription>
          </Alert>
        )}

        {showContainerAccessWarning && !loadError && (
          <Alert className="border-amber-200 bg-amber-50 text-amber-950 [&>svg]:text-amber-700">
            <AlertTriangle className="text-amber-700" />
            <AlertTitle>{m.binAccessTitle}</AlertTitle>
            <AlertDescription className="text-amber-900/90 text-xs leading-snug">{m.binAccessBody}</AlertDescription>
          </Alert>
        )}
      </div>

      <div className="max-w-md mx-auto px-4">
        <p className="text-xs text-gray-500 mb-2 text-center">
          {userPos ? m.mapHintWithLocation : m.mapHintNoLocation} {mapBasemapSuffix}
        </p>
        <ZagrebFacilitiesMap
          facilities={displayed}
          selectedId={selectedLocation?.id ?? null}
          onSelect={setSelectedLocation}
          userPos={userPos}
          loading={loadingData}
        />
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4 gap-2">
          <h2 className="font-bold text-gray-900">{m.nearestTitle}</h2>
          <button
            type="button"
            disabled={geoWorking || loadingData}
            onClick={onNearMe}
            className="flex items-center gap-1 text-sm text-green-600 font-semibold disabled:opacity-50 shrink-0"
          >
            {geoWorking ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Navigation className="w-4 h-4" />
            )}
            {m.nearMe}
          </button>
        </div>

        <div className="space-y-3">
          {loadingData && (
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {m.loadingLocations}
            </p>
          )}
          {!loadingData && displayed.length === 0 && !loadError && (
            <p className="text-sm text-gray-500">{m.noLocations}</p>
          )}
          {displayed.map((location) => (
            <motion.button
              key={location.id}
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedLocation(location)}
              className={`w-full text-left bg-white rounded-2xl shadow-md p-4 transition-all ${
                selectedLocation?.id === location.id
                  ? "ring-2 ring-green-500 shadow-lg"
                  : "hover:shadow-lg"
              }`}
            >
              <div className="flex gap-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    location.kind === "green_island"
                      ? "bg-emerald-100"
                      : location.kind === "recycling_yard"
                        ? "bg-teal-100"
                        : location.kind === "semi_underground_bin"
                          ? "bg-amber-100"
                          : "bg-blue-100"
                  }`}
                >
                  {location.kind === "green_island" ? (
                    <Leaf className="w-6 h-6 text-emerald-600" strokeWidth={2} />
                  ) : location.kind === "recycling_yard" ? (
                    <Recycle className="w-6 h-6 text-teal-600" />
                  ) : (
                    <Trash2
                      className={`w-6 h-6 ${
                        location.kind === "semi_underground_bin" ? "text-amber-600" : "text-blue-600"
                      }`}
                    />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-1 leading-snug">{location.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{location.address}</p>

                  <div className="flex flex-wrap gap-1">
                    {location.accepts.map((categoryId) => {
                      const category = getWasteCategory(categoryId, locale);
                      if (!category) return null;
                      return (
                        <span
                          key={categoryId}
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: category.binColorHex + "40",
                            color: category.binColorHex,
                          }}
                        >
                          {category.icon}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="text-right shrink-0 flex flex-col items-end gap-1">
                  <span className="text-xs font-semibold text-gray-900">
                    {location.distanceKm != null ? `${location.distanceKm.toFixed(1)} km` : "—"}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openDirections(location);
                    }}
                    className="text-[11px] text-green-600 font-medium"
                  >
                    {m.openMaps}
                  </button>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        <div className="mt-6 bg-white rounded-2xl shadow-sm p-4">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm">{m.legendTitle}</h3>
          <div className="grid grid-cols-1 gap-2.5 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Leaf className="w-4 h-4 text-emerald-600" strokeWidth={2} />
              </div>
              <span>{m.legendGreenIsland}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-teal-100 rounded-lg flex items-center justify-center">
                <Recycle className="w-4 h-4 text-teal-600" />
              </div>
              <span>{m.legendRecyclingYard}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                <Trash2 className="w-4 h-4 text-blue-600" />
              </div>
              <span>{m.legendUnderground}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-amber-100 rounded-lg flex items-center justify-center">
                <Trash2 className="w-4 h-4 text-amber-600" />
              </div>
              <span>{m.legendSemiUnderground}</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full border-[3px] shrink-0 box-border"
                style={{
                  borderColor: USER_LOCATION_MARKER.stroke,
                  backgroundColor: USER_LOCATION_MARKER.fill,
                }}
                aria-hidden
              />
              <span>{m.legendYou}</span>
            </div>
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}
