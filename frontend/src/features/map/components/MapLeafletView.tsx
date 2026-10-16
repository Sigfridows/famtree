"use client";

import { useEffect, useRef, useState } from "react";
import type L from "leaflet";
import type { AsylumMapPin } from "../api/get-asylum-map";
import { createPinHtml } from "./MapPopup";

interface MapLeafletViewProps {
  pins: AsylumMapPin[];
  activePinId: number | null;
  onPinSelect: (id: number) => void;
  onMapReady?: (mapInstance: L.Map) => void;
}

export default function MapLeafletView({
  pins,
  activePinId,
  onPinSelect,
  onMapReady,
}: MapLeafletViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<number, L.Marker>>({});
  const LRef = useRef<typeof L | null>(null);
  const [tileError, setTileError] = useState(false);
  const tilesRef = useRef<L.TileLayer | null>(null);
  const [readyMap, setReadyMap] = useState<L.Map | null>(null);

  // Mantenemos referencias estables de callbacks
  const onMapReadyRef = useRef(onMapReady);
  const onPinSelectRef = useRef(onPinSelect);

  useEffect(() => {
    onMapReadyRef.current = onMapReady;
    onPinSelectRef.current = onPinSelect;
  });

  // 1. Inicialización ÚNICA del mapa Leaflet
  useEffect(() => {
    let isCancelled = false;

    const initMap = async () => {
      if (typeof window === "undefined" || !mapRef.current) return;

      // Inyección de CSS de Leaflet si no existe
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      const LeafletModule = await import("leaflet");
      const L = LeafletModule.default;
      LRef.current = L;

      if (isCancelled || !mapRef.current) return;

      const container = mapRef.current as HTMLDivElement & {
        _leaflet_id?: string | null;
      };
      if (container._leaflet_id) {
        container._leaflet_id = null;
      }

      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }

      const map = L.map(mapRef.current, {
        center: [18.9, -70.2],
        zoom: 7,
        minZoom: 7,
        maxZoom: 19,
        maxBounds: [[17.2, -72.5], [20.5, -68]],
        maxBoundsViscosity: 0.8,
        zoomControl: false,
      });

      const tiles = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);
      tilesRef.current = tiles;
      tiles.on("tileerror", () => setTileError(true));
      const resizeObserver = new ResizeObserver(() => map.invalidateSize());
      resizeObserver.observe(mapRef.current);
      map.on("unload", () => resizeObserver.disconnect());

      leafletMap.current = map;
      setReadyMap(map);

      if (!isCancelled && onMapReadyRef.current) {
        onMapReadyRef.current(map);
      }
    };

    void initMap();

    return () => {
      isCancelled = true;
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
      markersRef.current = {};
    };
  }, []);

  // 2. Manejo y actualización reactiva de marcadores
  useEffect(() => {
    const L = LRef.current;
    const map = readyMap;
    if (!L || !map) return;

    const currentPinIds = new Set(pins.map((p) => p.id));

    Object.keys(markersRef.current).forEach((idStr) => {
      const id = Number(idStr);
      if (!currentPinIds.has(id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

    pins.forEach((pin) => {
      if (pin.latitude == null || pin.longitude == null) return;

      const isSelected = pin.id === activePinId;
      const customIcon = L.divIcon({
        className: "custom-pin-marker",
        html: createPinHtml(isSelected),
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      if (markersRef.current[pin.id]) {
        markersRef.current[pin.id].setIcon(customIcon);
        markersRef.current[pin.id].setLatLng([pin.latitude, pin.longitude]);
      } else {
        const marker = L.marker([pin.latitude, pin.longitude], {
          icon: customIcon,
        }).addTo(map);

        marker.on("click", () => {
          if (onPinSelectRef.current) {
            onPinSelectRef.current(pin.id);
          }
        });

        markersRef.current[pin.id] = marker;
      }
    });
  }, [pins, activePinId, readyMap]);

  // 3. Animación de vuelo (flyTo)
  useEffect(() => {
    const map = readyMap;
    if (!map || !activePinId) return;

    const activePin = pins.find((p) => p.id === activePinId);
    if (activePin && activePin.latitude != null && activePin.longitude != null) {
      map.flyTo([activePin.latitude, activePin.longitude], 14, {
        duration: 0.8,
      });
    }
  }, [activePinId, pins, readyMap]);

  return (
    <>
    {tileError && <div role="alert" className="absolute bottom-20 left-28 z-30 rounded-xl bg-amber-950 p-3 text-xs text-amber-100">No se pudo cargar parte del mapa. <button type="button" onClick={() => { setTileError(false); tilesRef.current?.redraw(); }}>Reintentar</button></div>}
    <div
      ref={mapRef} 
      className="absolute inset-0 w-full h-full z-0 dark:brightness-[0.82] dark:contrast-[1.25] dark:hue-rotate-180 dark:invert-[0.92] transition-all duration-300" 
    />
    </>
  );
}
