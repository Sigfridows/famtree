"use client";

import { Phone, Mail, MapPin, FileText } from "lucide-react";
import { CustomSelect } from "./CustomSelect";

interface ContactSectionProps {
  phone: string;
  email: string;
  city: string;
  municipality: string;
  bio: string;
  createdAt: string;
  onPhoneChange: (val: string) => void;
  onEmailChange: (val: string) => void;
  onCityChange: (val: string) => void;
  onMunicipalityChange: (val: string) => void;
  onBioChange: (val: string) => void;
}

export function ContactSection({
  phone,
  email,
  city,
  municipality,
  bio,
  createdAt,
  onPhoneChange,
  onEmailChange,
  onCityChange,
  onMunicipalityChange,
  onBioChange,
}: ContactSectionProps) {
  return (
    <section className="bg-white rounded-xl p-6 shadow-sm border border-zinc-200/60 space-y-6">
      <h3 className="font-bold text-xs text-zinc-400 uppercase tracking-wider">
        Contacto
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-800">
            <Phone className="w-3.5 h-3.5 text-zinc-600" />
            <span>Teléfono</span>
          </div>
          <input
            type="text"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            className="w-full bg-white border border-zinc-200 rounded-[5px] px-3.5 py-2 text-xs font-semibold text-zinc-700 focus:outline-none focus:border-zinc-400 transition-colors shadow-xs"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-800">
            <Mail className="w-3.5 h-3.5 text-zinc-600" />
            <span>Email</span>
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            className="w-full bg-white border border-zinc-200 rounded-[5px] px-3.5 py-2 text-xs font-semibold text-zinc-700 focus:outline-none focus:border-zinc-400 transition-colors shadow-xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CustomSelect
          label="Ciudad"
          icon={<MapPin className="w-3.5 h-3.5 text-zinc-600" />}
          value={city}
          options={["Santo Domingo", "Santiago", "La Vega", "Puerto Plata"]}
          onChange={onCityChange}
        />

        <CustomSelect
          label="Municipio"
          icon={<MapPin className="w-3.5 h-3.5 text-zinc-600" />}
          value={municipality}
          options={[
            "Los Alcarrizos",
            "Santo Domingo Este",
            "Santo Domingo Oeste",
            "Distrito Nacional",
          ]}
          onChange={onMunicipalityChange}
        />
      </div>

      <div className="space-y-2 pt-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-800">
          <FileText className="w-3.5 h-3.5 text-zinc-600" />
          <span>Biografía</span>
        </div>
        <textarea
          value={bio}
          onChange={(e) => onBioChange(e.target.value)}
          rows={6}
          className="w-full bg-white border border-zinc-200 rounded-[5px] p-3.5 text-xs text-zinc-500 font-medium leading-relaxed focus:outline-none focus:border-zinc-400 transition-colors resize-none shadow-xs"
        />
      </div>

      <div className="flex items-center justify-between text-xs pt-2">
        <span className="font-bold text-zinc-700 shrink-0">Fecha de creación</span>
        <div className="flex-1 border-b border-dotted border-zinc-300 mx-3" />
        <span className="text-zinc-400 font-medium shrink-0">{createdAt}</span>
      </div>
    </section>
  );
}