"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { LocateFixed, Plus, Minus, MapPin, Navigation } from "lucide-react";
import HeaderDesign from "@/components/shared/HeaderDesing";
import HeaderControls from "@/components/shared/HeaderControls";
import logoFamTree from "@/assets/logo-famtree.png";
import type L from "leaflet";

export interface MapItem {
  id: string;
  code: string;
  status: string;
  isOpen: boolean;
  distance: string;
  title: string;
  pickup: string;
  destination: string;
  duration: string;
  miles: string;
  delay: string;
  lat: number;
  lng: number;
}

const MOCK_MAP_ITEMS: MapItem[] = [
  {
    id: "1",
    code: "CR-YAB-008",
    status: "Abierto",
    isOpen: true,
    distance: "56km",
    title: 'Residencial Geriátrico "Senda Verde"',
    pickup: "Av. Tiradentes #28, Ensanche Naco, Santo Domingo",
    destination: "Calle José Brea Peña #12, Evaristo Morales",
    duration: "2h 23mins",
    miles: "84.2 millas",
    delay: "65 minutos tarde",
    lat: 18.4735,
    lng: -69.9328,
  },
  {
    id: "2",
    code: "CR-YAB-009",
    status: "Abierto",
    isOpen: true,
    distance: "12km",
    title: "Asilo Fuente de Luz",
    pickup: "18 Bode Thomas Street, Surulere",
    destination: "11 Secretariat Road, Bodija",
    duration: "45mins",
    miles: "15.4 millas",
    delay: "A tiempo",
    lat: 18.4682,
    lng: -69.9412,
  },
  {
    id: "3",
    code: "CR-YAB-010",
    status: "Cerrado",
    isOpen: false,
    distance: "30km",
    title: "Centro Residencial Vida Plena",
    pickup: "Av. Abraham Lincoln #102, Piantini",
    destination: "Calle Roberto Pastoriza #401",
    duration: "1h 10mins",
    miles: "28.0 millas",
    delay: "10 minutos tarde",
    lat: 18.4554,
    lng: -69.9521,
  },
  {
    id: "4",
    code: "CR-YAB-011",
    status: "Abierto",
    isOpen: true,
    distance: "18km",
    title: "Hogar Dorado Residencia",
    pickup: "Calle 1ra, Los Cacicazgos",
    destination: "Av. Anacaona #45",
    duration: "30mins",
    miles: "10.2 millas",
    delay: "A tiempo",
    lat: 18.4811,
    lng: -69.915,
  },
  {
    id: "5",
    code: "CR-YAB-012",
    status: "Abierto",
    isOpen: true,
    distance: "22km",
    title: "Villa Senior Care",
    pickup: "Av. Sarasota #12",
    destination: "Calle Bella Vista #88",
    duration: "40mins",
    miles: "14.0 millas",
    delay: "5 minutos tarde",
    lat: 18.4601,
    lng: -69.9654,
  },
];

// Helper visual para los marcadores fuera del componente
function createPinHtml(isSelected: boolean): string {
  if (isSelected) {
    return `
      <div class="relative flex items-center justify-center w-8 h-8">
        <span class="absolute w-9 h-9 rounded-full bg-[#CCDD99]/60 animate-ping"></span>
        <div class="w-6 h-6 rounded-full bg-[#CCDD99] ring-2 ring-white flex items-center justify-center shadow-[0_0_18px_rgba(204,221,153,1)]">
          <div class="w-3.5 h-3.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,1)]"></div>
        </div>
      </div>
    `;
  }
  return `
    <div class="relative flex items-center justify-center w-8 h-8">
      <div class="w-5 h-5 rounded-full bg-[#CCDD99] flex items-center justify-center shadow-md hover:scale-110 transition-transform">
        <div class="w-3.5 h-3.5 rounded-full bg-[#161616]"></div>
      </div>
    </div>
  `;
}

export default function MapaPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeItemId, setActiveItemId] = useState<string | null>("1");
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const LRef = useRef<typeof L | null>(null);

  /// 1. Inicialización única del mapa al montar el componente
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
        zoom: 13,
        zoomControl: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      leafletMap.current = map;

      // Crear marcadores iniciales usando 'false' para no depender de activeItemId
      MOCK_MAP_ITEMS.forEach((item) => {
        const customIcon = L.divIcon({
          className: "custom-pin-marker",
          html: createPinHtml(false),
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([item.lat, item.lng], {
          icon: customIcon,
        }).addTo(map);

        marker.on("click", () => {
          setActiveItemId(item.id);
        });

        markersRef.current[item.id] = marker;
      });
    };

    void initMap();

    return () => {
      isMounted = false;
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);

  // 2. Reacción dinámica a selecciones (actualiza marcadores y mueve la cámara)
  useEffect(() => {
    const L = LRef.current;
    if (!L || !leafletMap.current) return;

    MOCK_MAP_ITEMS.forEach((item) => {
      const marker = markersRef.current[item.id];
      if (marker) {
        const isSelected = item.id === activeItemId;
        const updatedIcon = L.divIcon({
          className: "custom-pin-marker",
          html: createPinHtml(isSelected),
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });
        marker.setIcon(updatedIcon);
      }
    });

    const activeItem = MOCK_MAP_ITEMS.find((i) => i.id === activeItemId);
    if (activeItem) {
      leafletMap.current.flyTo([activeItem.lat, activeItem.lng], 14, {
        duration: 0.8,
      });
    }
  }, [activeItemId]);

  const handleZoomIn = () => leafletMap.current?.zoomIn();
  const handleZoomOut = () => leafletMap.current?.zoomOut();
  const handleCenterLocation = () => {
    leafletMap.current?.flyTo([18.47, -69.935], 13);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#F3F3F3] text-[#161616] font-montserrat pl-20 pr-0 pt-0">
      {/* 1. LIENZO DEL MAPA */}
      <div ref={mapRef} className="absolute inset-0 w-full h-full z-0" />

      {/* 2. CABECERA FLOTANTE */}
      <header className="absolute top-0 left-20 right-0 z-30 px-6 pt-0 flex flex-col lg:flex-row items-center justify-between gap-4 pointer-events-none">
        <div className="pointer-events-auto w-full lg:flex-1">
          <HeaderDesign
            title="Mapa Interactivo"
            subtitle="Asilos cercanos"
            className="w-full lg:pr-32 shadow-md"
          />
        </div>

        <div className="pointer-events-auto flex items-center gap-3 shrink-0 lg:-ml-24 relative z-30 pt-4 lg:pt-0 pr-6">
          <HeaderControls
            logoSrc={logoFamTree}
            placeholder="¿Qué quieres encontrar?"
            bgClass="bg-white shadow-md"
            borderClass="border-[#A4A4A4]"
            placeholderClass="placeholder-zinc-400 text-[#161616]"
            buttonBgClass="bg-[#161616] hover:bg-[#b0c872]"
            buttonTextClass="text-white hover:text-[#161616]"
            searchValue={searchQuery}
            onSearchChange={(e) => setSearchQuery(e.target.value)}
            onSearch={() => console.log("Buscando en mapa...", searchQuery)}
          />
        </div>
      </header>

      {/* 3. CONTROLES DEL MAPA */}
      <div className="absolute bottom-6 left-28 z-20 flex items-center gap-2">
        <button
          onClick={handleCenterLocation}
          className="w-10 h-10 bg-[#161616] text-white rounded-xl flex items-center justify-center shadow-xl hover:bg-zinc-800 transition-colors cursor-pointer"
          title="Mi Ubicación"
        >
          <LocateFixed className="w-5 h-5" />
        </button>

        <div className="flex items-center bg-[#161616] text-white rounded-xl shadow-xl overflow-hidden divide-x divide-zinc-700">
          <button
            onClick={handleZoomIn}
            className="w-10 h-10 flex items-center justify-center hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Acercar"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-10 h-10 flex items-center justify-center hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Alejar"
          >
            <Minus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 4. TARJETAS LATERALES */}
      <aside className="absolute top-32 right-6 bottom-6 z-20 w-full max-w-105 overflow-y-auto space-y-3 p-2 scrollbar-none">
        {MOCK_MAP_ITEMS.map((item, idx) => {
          const isSelected = activeItemId === item.id;
          return (
            <motion.div
              key={item.id}
              onClick={() => setActiveItemId(item.id)}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.08 }}
              className={`cursor-pointer rounded-[10px] p-4 shadow-xl border-2 transition-all duration-200 space-y-3 text-xs ${
                isSelected
                  ? "bg-white border-[#161616] scale-[1.01]"
                  : "bg-white/95 backdrop-blur-md border-transparent hover:bg-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded-md font-mono text-[10px] font-bold">
                    {item.code}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                      item.isOpen
                        ? "bg-[#CCDD99]/60 text-emerald-900"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <span className="text-zinc-400 font-bold text-[11px]">
                  {item.distance}
                </span>
              </div>

              <h3 className="font-extrabold text-sm text-zinc-900 leading-tight">
                {item.title}
              </h3>

              <div className="space-y-2 pt-1">
                <div className="flex items-start gap-2 text-zinc-600">
                  <Navigation className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                  <p className="line-clamp-1">{item.pickup}</p>
                </div>
                <div className="flex items-start gap-2 text-zinc-600">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="line-clamp-1">{item.destination}</p>
                </div>
              </div>

              <div className="flex items-center justify-around text-[11px] text-zinc-400 font-medium pt-2 border-t border-zinc-100">
                <span>{item.duration}</span>
                <span>{item.miles}</span>
                <span className="text-zinc-500">{item.delay}</span>
              </div>
            </motion.div>
          );
        })}
      </aside>
    </div>
  );
}
