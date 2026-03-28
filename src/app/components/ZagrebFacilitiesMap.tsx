import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import L from "leaflet";
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useUIStrings } from "../i18n/uiStrings";
import { ZAGREB_CENTER, type MapFacility } from "../utils/zagrebOpenData";

const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

/** Distinct from facility markers; shared with legend in MapScreen. */
export const USER_LOCATION_MARKER = {
  stroke: "#6d28d9",
  fill: "#c4b5fd",
  weight: 3,
  fillOpacity: 0.95,
  radius: 8,
} as const;

function kindStyle(kind: MapFacility["kind"]) {
  switch (kind) {
    case "green_island":
      return { fill: "#22c55e", border: "#ffffff" };
    case "recycling_yard":
      return { fill: "#0d9488", border: "#ffffff" };
    case "semi_underground_bin":
      return { fill: "#d97706", border: "#ffffff" };
    default:
      return { fill: "#2563eb", border: "#ffffff" };
  }
}

/** Tailwind/flex layouts often leave the map at 0×0 until after paint; Leaflet needs a resize. */
function MapInvalidateSize() {
  const map = useMap();
  const container = map.getContainer();
  useEffect(() => {
    let cancelled = false;
    const run = () => {
      if (cancelled) return;
      map.invalidateSize();
    };
    const id = requestAnimationFrame(() => {
      run();
      requestAnimationFrame(run);
    });
    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            requestAnimationFrame(run);
          })
        : null;
    ro?.observe(container);
    return () => {
      cancelled = true;
      cancelAnimationFrame(id);
      ro?.disconnect();
    };
  }, [map, container]);
  return null;
}

function MapController({
  facilities,
  selectedId,
  userPos,
}: {
  facilities: MapFacility[];
  selectedId: string | null;
  userPos: { lat: number; lng: number } | null;
}) {
  const map = useMap();
  const displayKey = facilities.map((f) => f.id).join("|");
  const skipNextSelectPan = useRef(false);

  useEffect(() => {
    if (facilities.length === 0) {
      map.setView([ZAGREB_CENTER.lat, ZAGREB_CENTER.lng], 12);
      return;
    }
    const bounds = L.latLngBounds(facilities.map((f) => [f.lat, f.lng] as [number, number]));
    if (userPos) bounds.extend([userPos.lat, userPos.lng]);
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 15, animate: true });
    skipNextSelectPan.current = true;
  }, [map, displayKey, userPos?.lat, userPos?.lng]);

  useEffect(() => {
    const f = facilities.find((x) => x.id === selectedId);
    if (!f || facilities.length === 0) return;
    if (skipNextSelectPan.current) {
      skipNextSelectPan.current = false;
      return;
    }
    const z = Math.min(Math.max(map.getZoom(), 14), 16);
    map.flyTo([f.lat, f.lng], z, { duration: 0.45 });
  }, [map, selectedId, facilities]);

  return null;
}

interface ZagrebFacilitiesMapProps {
  facilities: MapFacility[];
  selectedId: string | null;
  onSelect: (f: MapFacility) => void;
  userPos: { lat: number; lng: number } | null;
  loading: boolean;
}

export function ZagrebFacilitiesMap({
  facilities,
  selectedId,
  onSelect,
  userPos,
  loading,
}: ZagrebFacilitiesMapProps) {
  const ui = useUIStrings();
  const m = ui.map;

  if (loading) {
    return (
      <div className="relative h-[min(52vh,22rem)] w-full rounded-2xl bg-slate-200 flex flex-col items-center justify-center gap-2 border border-slate-200/90 shadow-md">
        <Loader2 className="w-8 h-8 text-slate-500 animate-spin" aria-hidden />
        <span className="text-sm text-slate-600">{m.mapLoading}</span>
      </div>
    );
  }

  return (
    <div className="relative h-[min(52vh,22rem)] w-full rounded-2xl overflow-hidden border border-slate-200/90 shadow-md z-0">
      <MapContainer
        center={[ZAGREB_CENTER.lat, ZAGREB_CENTER.lng]}
        zoom={13}
        className="h-full w-full [&_.leaflet-control-attribution]:text-[10px] [&_.leaflet-control-attribution]:bg-white/90"
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom
      >
        <TileLayer attribution={OSM_ATTRIBUTION} url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapInvalidateSize />
        <MapController facilities={facilities} selectedId={selectedId} userPos={userPos} />
        {userPos && (
          <CircleMarker
            center={[userPos.lat, userPos.lng]}
            radius={USER_LOCATION_MARKER.radius}
            pathOptions={{
              color: USER_LOCATION_MARKER.stroke,
              weight: USER_LOCATION_MARKER.weight,
              fillColor: USER_LOCATION_MARKER.fill,
              fillOpacity: USER_LOCATION_MARKER.fillOpacity,
            }}
          >
            <Tooltip
              permanent
              direction="top"
              offset={[0, -10]}
              opacity={1}
              className="user-location-label"
            >
              {m.mapYou}
            </Tooltip>
            <Popup>{m.mapYourLocation}</Popup>
          </CircleMarker>
        )}
        {facilities.map((f) => {
          const selected = f.id === selectedId;
          const { fill, border } = kindStyle(f.kind);
          return (
            <CircleMarker
              key={f.id}
              center={[f.lat, f.lng]}
              radius={selected ? 11 : 7}
              pathOptions={{
                color: border,
                weight: selected ? 3 : 2,
                fillColor: fill,
                fillOpacity: selected ? 1 : 0.88,
              }}
              eventHandlers={{
                click: () => onSelect(f),
              }}
            >
              <Popup>
                <div className="min-w-[200px] text-gray-900">
                  <p className="font-semibold text-sm leading-snug">{f.name}</p>
                  <p className="text-xs text-gray-600 mt-1">{f.address}</p>
                  {f.distanceKm != null && (
                    <p className="text-xs text-gray-500 mt-1">{f.distanceKm.toFixed(1)} km</p>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
