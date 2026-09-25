"use client";

import { useEffect, useRef } from "react";
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

  // 1. Inicialización del mapa Leaflet
  useEffect(() => {
    let isMounted = true;

    const initMap = async () => {
      if (typeof window === "undefined" || !mapRef.current) return;

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

      if (!isMounted || !mapRef.current) return;

      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }

      const container = mapRef.current as HTMLDivElement & {
        _leaflet_id?: string | null;
      };
      if (container._leaflet_id) {
        container._leaflet_id = null;
      }

      const map = L.map(mapRef.current, {
        center: [18.47, -69.935],
        zoom: 12,
        zoomControl: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      leafletMap.current = map;
      if (isMounted && onMapReady) {
        onMapReady(map);
      }
    };

    void initMap();

    return () => {
      isMounted = false;
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, [onMapReady]);

  // 2. Renderizado dinámico de marcadores reales
  useEffect(() => {
    const L = LRef.current;
    const map = leafletMap.current;
    if (!L || !map) return;

    // Limpiar marcadores viejos
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    pins.forEach((pin) => {
      if (!pin.latitude || !pin.longitude) return;

      const isSelected = pin.id === activePinId;
      const customIcon = L.divIcon({
        className: "custom-pin-marker",
        html: createPinHtml(isSelected),
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([pin.latitude, pin.longitude], {
        icon: customIcon,
      }).addTo(map);

      marker.on("click", () => {
        onPinSelect(pin.id);
      });

      markersRef.current[pin.id] = marker;
    });
  }, [pins, activePinId, onPinSelect]);

  // 3. Volar a la ubicación del pin activo
  useEffect(() => {
    if (!leafletMap.current || !activePinId) return;

    const activePin = pins.find((p) => p.id === activePinId);
    if (activePin?.latitude && activePin.longitude) {
      leafletMap.current.flyTo([activePin.latitude, activePin.longitude], 14, {
        duration: 0.8,
      });
    }
  }, [activePinId, pins]);

  return <div ref={mapRef} className="absolute inset-0 w-full h-full z-0" />;
}