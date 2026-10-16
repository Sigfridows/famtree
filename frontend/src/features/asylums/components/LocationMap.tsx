"use client";
import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

export default function LocationMap({ latitude, longitude }: {latitude?: number; longitude?: number}) {
  const container = useRef<HTMLDivElement>(null);
  const valid = latitude !== undefined && longitude !== undefined && Number.isFinite(latitude) && Number.isFinite(longitude);
  useEffect(() => {
    if (!valid || !container.current) return;
    let disposed = false;
    let cleanup: (() => void) | undefined;
    void import('leaflet').then(({default: L}) => {
      if (disposed || !container.current) return;
      const map = L.map(container.current).setView([latitude!, longitude!], 15);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 19, attribution: '&copy; OpenStreetMap'}).addTo(map);
      L.circleMarker([latitude!, longitude!], {radius: 9, color: '#324408', fillColor: '#CCDD99', fillOpacity: 1}).addTo(map);
      const resize = new ResizeObserver(() => map.invalidateSize());
      resize.observe(container.current);
      cleanup = () => { resize.disconnect(); map.remove(); };
    });
    return () => { disposed = true; cleanup?.(); };
  }, [valid, latitude, longitude]);
  if (!valid) return <p>Ubicación en mapa no disponible para este centro.</p>;
  return <div ref={container} aria-label="Ubicación del centro" className="relative z-0 h-44 w-full rounded-xl" />;
}
