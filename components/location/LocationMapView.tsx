"use client";

import { useEffect, useRef, useState } from "react";
import {
  Map as MapLibreMap,
  Marker,
  NavigationControl,
  setWorkerUrl,
  type StyleSpecification,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export interface LocationMapViewProps {
  latitude: number | null | undefined;
  longitude: number | null | undefined;
  onCoordinatesChange: (latitude: number, longitude: number) => void;
  disabled?: boolean;
  className?: string;
}

const VIETNAM_DEFAULT_CENTER: [number, number] = [108.20623, 16.047079];
const VIETNAM_DEFAULT_ZOOM = 5.5;
const DETAIL_ZOOM = 16;
const PRIMARY_MARKER_COLOR = "#088178";

export const OSM_RASTER_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    "osm-tiles": {
      type: "raster",
      tiles: [
        "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
    },
  },
  layers: [
    {
      id: "osm-tiles-layer",
      type: "raster",
      source: "osm-tiles",
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

function roundCoordinate(val: number): number {
  return Math.round(val * 1000000) / 1000000;
}

function isWebGLSupported(): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return false;
  }
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")),
    );
  } catch {
    return false;
  }
}

export default function LocationMapView({
  latitude,
  longitude,
  onCoordinatesChange,
  disabled = false,
  className = "",
}: LocationMapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const isInternalInteractionRef = useRef(false);
  const onCoordinatesChangeRef = useRef(onCoordinatesChange);
  const disabledRef = useRef(disabled);

  const [isLocating, setIsLocating] = useState(false);
  const [tileMode, setTileMode] = useState<"geoapify" | "osm">(() =>
    process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY ? "geoapify" : "osm",
  );

  const [isSupported] = useState(() => isWebGLSupported());

  const initialCoordinatesRef = useRef<{ lat: number | null; lng: number | null }>({
    lat: latitude ?? null,
    lng: longitude ?? null,
  });

  useEffect(() => {
    onCoordinatesChangeRef.current = onCoordinatesChange;
  }, [onCoordinatesChange]);

  useEffect(() => {
    disabledRef.current = disabled;
  }, [disabled]);

  const hasValidCoordinates =
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    !isNaN(latitude) &&
    !isNaN(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180;

  useEffect(() => {
    if (!containerRef.current || !isSupported) return;

    if (typeof window !== "undefined") {
      try {
        setWorkerUrl(`${window.location.origin}/maplibre-gl-worker.mjs`);
      } catch {
        setWorkerUrl("https://unpkg.com/maplibre-gl@6.13.0/dist/maplibre-gl-worker.mjs");
      }
    }

    const geoapifyKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;
    const initialStyle: StyleSpecification | string =
      geoapifyKey && geoapifyKey.trim() !== ""
        ? `https://maps.geoapify.com/v1/styles/osm-bright/style.json?apiKey=${geoapifyKey.trim()}`
        : OSM_RASTER_STYLE;

    const initialLat = initialCoordinatesRef.current.lat;
    const initialLng = initialCoordinatesRef.current.lng;
    const hasInitial =
      typeof initialLat === "number" &&
      typeof initialLng === "number" &&
      !isNaN(initialLat) &&
      !isNaN(initialLng);

    const initialCenter: [number, number] = hasInitial
      ? [initialLng, initialLat]
      : VIETNAM_DEFAULT_CENTER;

    const initialZoom = hasInitial ? DETAIL_ZOOM : VIETNAM_DEFAULT_ZOOM;

    const map = new MapLibreMap({
      container: containerRef.current,
      style: initialStyle,
      center: initialCenter,
      zoom: initialZoom,
      attributionControl: { compact: true },
    });

    mapRef.current = map;

    map.addControl(new NavigationControl({ showCompass: true }), "top-right");

    map.on("error", (event) => {
      if (geoapifyKey) {
        const errorMsg = event.error?.message ?? "";
        if (errorMsg.includes("style") || errorMsg.includes("401") || errorMsg.includes("403")) {
          setTileMode("osm");
          map.setStyle(OSM_RASTER_STYLE);
        }
      }
    });

    if (hasInitial) {
      const marker = new Marker({
        draggable: !disabledRef.current,
        color: PRIMARY_MARKER_COLOR,
      })
        .setLngLat([initialLng, initialLat])
        .addTo(map);

      marker.on("dragend", () => {
        const lngLat = marker.getLngLat();
        isInternalInteractionRef.current = true;
        onCoordinatesChangeRef.current(roundCoordinate(lngLat.lat), roundCoordinate(lngLat.lng));
      });

      markerRef.current = marker;
    }

    map.on("click", (event) => {
      if (disabledRef.current) return;
      const { lng, lat } = event.lngLat;
      const roundedLat = roundCoordinate(lat);
      const roundedLng = roundCoordinate(lng);

      if (markerRef.current) {
        markerRef.current.setLngLat([roundedLng, roundedLat]);
      } else {
        const newMarker = new Marker({
          draggable: !disabledRef.current,
          color: PRIMARY_MARKER_COLOR,
        })
          .setLngLat([roundedLng, roundedLat])
          .addTo(map);

        newMarker.on("dragend", () => {
          const lngLat = newMarker.getLngLat();
          isInternalInteractionRef.current = true;
          onCoordinatesChangeRef.current(roundCoordinate(lngLat.lat), roundCoordinate(lngLat.lng));
        });

        markerRef.current = newMarker;
      }

      isInternalInteractionRef.current = true;
      onCoordinatesChangeRef.current(roundedLat, roundedLng);
    });

    map.getCanvas().style.cursor = disabledRef.current ? "default" : "crosshair";

    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.resize();
      }
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      map.remove();
      mapRef.current = null;
    };
  }, [isSupported]);

  // Sync cursor and draggable state when disabled changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.getCanvas().style.cursor = disabled ? "default" : "crosshair";
    if (markerRef.current) {
      markerRef.current.setDraggable(!disabled);
    }
  }, [disabled]);

  // Sync external coordinates update with marker and map position
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (isInternalInteractionRef.current) {
      isInternalInteractionRef.current = false;
      return;
    }

    if (!hasValidCoordinates) {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      return;
    }

    const targetPos: [number, number] = [longitude, latitude];

    if (markerRef.current) {
      markerRef.current.setLngLat(targetPos);
    } else {
      const newMarker = new Marker({
        draggable: !disabledRef.current,
        color: PRIMARY_MARKER_COLOR,
      })
        .setLngLat(targetPos)
        .addTo(map);

      newMarker.on("dragend", () => {
        const lngLat = newMarker.getLngLat();
        isInternalInteractionRef.current = true;
        onCoordinatesChangeRef.current(roundCoordinate(lngLat.lat), roundCoordinate(lngLat.lng));
      });

      markerRef.current = newMarker;
    }

    const currentCenter = map.getCenter();
    const isAlreadyAtTarget =
      Math.abs(currentCenter.lng - longitude) < 0.0001 &&
      Math.abs(currentCenter.lat - latitude) < 0.0001 &&
      map.getZoom() >= DETAIL_ZOOM - 0.5;

    if (!isAlreadyAtTarget) {
      map.flyTo({
        center: targetPos,
        zoom: Math.max(map.getZoom(), DETAIL_ZOOM),
        essential: true,
      });
    }
  }, [latitude, longitude, hasValidCoordinates]);

  const handleRecenter = () => {
    const map = mapRef.current;
    if (!map) return;
    if (hasValidCoordinates) {
      map.flyTo({
        center: [longitude, latitude],
        zoom: DETAIL_ZOOM,
        essential: true,
      });
    } else {
      map.flyTo({
        center: VIETNAM_DEFAULT_CENTER,
        zoom: VIETNAM_DEFAULT_ZOOM,
        essential: true,
      });
    }
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const lat = roundCoordinate(position.coords.latitude);
        const lng = roundCoordinate(position.coords.longitude);

        if (mapRef.current) {
          mapRef.current.flyTo({
            center: [lng, lat],
            zoom: DETAIL_ZOOM,
            essential: true,
          });
        }

        if (markerRef.current) {
          markerRef.current.setLngLat([lng, lat]);
        } else if (mapRef.current) {
          const newMarker = new Marker({
            draggable: !disabledRef.current,
            color: PRIMARY_MARKER_COLOR,
          })
            .setLngLat([lng, lat])
            .addTo(mapRef.current);

          newMarker.on("dragend", () => {
            const lngLat = newMarker.getLngLat();
            isInternalInteractionRef.current = true;
            onCoordinatesChangeRef.current(roundCoordinate(lngLat.lat), roundCoordinate(lngLat.lng));
          });

          markerRef.current = newMarker;
        }

        isInternalInteractionRef.current = true;
        onCoordinatesChangeRef.current(lat, lng);
      },
      () => {
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  if (!isSupported) {
    return (
      <div className={`relative flex h-80 w-full flex-col items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 p-4 text-center ${className}`}>
        <p className="font-semibold text-gray-700">Interactive Map View</p>
        <p className="mt-1 text-xs text-gray-500">
          Coordinates: {hasValidCoordinates ? `${latitude}, ${longitude}` : "Not set"}
        </p>
      </div>
    );
  }

  return (
    <div className={`relative h-80 w-full overflow-hidden rounded-2xl border border-gray-200 shadow-sm ${className}`}>
      <div ref={containerRef} className="h-full w-full" aria-label="Interactive map" />

      {/* Map overlay controls */}
      <div className="pointer-events-none absolute inset-x-3 bottom-3 flex flex-wrap items-center justify-between gap-2">
        <div className="pointer-events-auto flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-700 shadow backdrop-blur-sm">
          <span className="size-2 rounded-full bg-primary" />
          <span>
            {hasValidCoordinates
              ? `${latitude?.toFixed(5)}, ${longitude?.toFixed(5)}`
              : "Click map or drag pin to position store"}
          </span>
          <span className="text-[10px] text-gray-400">
            ({tileMode === "geoapify" ? "Geoapify" : "OSM Free Tiles"})
          </span>
        </div>

        <div className="pointer-events-auto flex gap-1.5">
          <button
            type="button"
            onClick={handleLocateMe}
            disabled={isLocating || disabled}
            title="Locate my position"
            aria-label="Locate my current position"
            className="flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-gray-700 shadow hover:bg-white hover:text-primary backdrop-blur-sm transition-colors disabled:opacity-50"
          >
            <svg
              className={`size-3.5 ${isLocating ? "animate-spin text-primary" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="3" strokeWidth="2" />
              <path strokeWidth="2" d="M12 2v3m0 14v3M2 12h3m14 0h3" />
            </svg>
            <span>{isLocating ? "Locating…" : "My Location"}</span>
          </button>

          {hasValidCoordinates && (
            <button
              type="button"
              onClick={handleRecenter}
              title="Recenter on pin"
              aria-label="Recenter map on pin"
              className="flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-gray-700 shadow hover:bg-white hover:text-primary backdrop-blur-sm transition-colors"
            >
              <span>Recenter</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
