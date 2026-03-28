import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import L from "leaflet";
import GoogleMutant from "leaflet.gridlayer.googlemutant/src/Leaflet.GoogleMutant.mjs";

let registered = false;
/** `setOptions` is only effective once per page load (see js-api-loader README). */
let mapsOptionsInstalled = false;

function ensureMapsLoaderOptions(key: string) {
  if (mapsOptionsInstalled) return;
  setOptions({ key, v: "weekly" });
  mapsOptionsInstalled = true;
}

function registerGoogleMutant() {
  if (registered) return;
  const GridLayer = L.GridLayer as typeof L.GridLayer & {
    GoogleMutant: typeof GoogleMutant;
  };
  GridLayer.GoogleMutant = GoogleMutant;
  (L.gridLayer as typeof L.gridLayer & { googleMutant: (o: { type: string }) => L.GridLayer }).googleMutant =
    function googleMutant(options: { type: string }) {
      return new GoogleMutant(options) as L.GridLayer;
    };
  registered = true;
}

type Props = {
  apiKey: string;
  onLoadError?: () => void;
  /** Called after the Google layer is added so OSM fallback can be removed. */
  onReady?: () => void;
};

/**
 * Google Maps roadmap basemap for react-leaflet (official JS API + GridLayer.GoogleMutant).
 */
export function GoogleMutantLayer({ apiKey, onLoadError, onReady }: Props) {
  const map = useMap();
  const layerRef = useRef<L.GridLayer | null>(null);
  const onLoadErrorRef = useRef(onLoadError);
  const onReadyRef = useRef(onReady);
  onLoadErrorRef.current = onLoadError;
  onReadyRef.current = onReady;

  useEffect(() => {
    let cancelled = false;
    ensureMapsLoaderOptions(apiKey);

    void importLibrary("maps")
      .then(() => {
        if (cancelled) return;
        registerGoogleMutant();
        const layer = (L.gridLayer as typeof L.gridLayer & { googleMutant: (o: { type: string }) => L.GridLayer }).googleMutant({
          type: "roadmap",
        });
        layerRef.current = layer;
        layer.addTo(map);
        onReadyRef.current?.();
      })
      .catch(() => {
        if (!cancelled) onLoadErrorRef.current?.();
      });

    return () => {
      cancelled = true;
      const layer = layerRef.current;
      layerRef.current = null;
      if (layer) {
        map.removeLayer(layer);
      }
    };
  }, [map, apiKey]);

  return null;
}
