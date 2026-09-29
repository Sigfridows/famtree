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

function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
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
  const handlePhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    onPhoneChange(formatted);
  };

  return (
    <section className="bg-[#141414] rounded-3xl p-6 sm:p-7 border border-white/10 shadow-2xl space-y-6 text-white font-montserrat">
      <h3 className="font-bold text-[11px] text-[#CCD999] uppercase tracking-wider">
        Contacto
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-300">
            <Phone className="w-3.5 h-3.5 text-[#CCD999]" />
            <span>Teléfono</span>
          </div>
          <input
            type="text"
            value={formatPhoneNumber(phone)}
            onChange={handlePhoneInputChange}
            placeholder="809-000-0000"
            maxLength={12}
            className="w-full bg-[#1c1c1c] border border-white/10 rounded-2xl px-4 py-2.5 text-xs font-semibold text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#CCD999] transition-all shadow-inner"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-300">
            <Mail className="w-3.5 h-3.5 text-[#CCD999]" />
            <span>Email</span>
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            className="w-full bg-[#1c1c1c] border border-white/10 rounded-2xl px-4 py-2.5 text-xs font-semibold text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#CCD999] transition-all shadow-inner"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CustomSelect
          label="Ciudad"
          icon={<MapPin className="w-3.5 h-3.5 text-[#CCD999]" />}
          value={city}
          options={["Santo Domingo", "Santiago", "La Vega", "Puerto Plata"]}
          onChange={onCityChange}
        />

        <CustomSelect
          label="Municipio"
          icon={<MapPin className="w-3.5 h-3.5 text-[#CCD999]" />}
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
        <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-300">
          <FileText className="w-3.5 h-3.5 text-[#CCD999]" />
          <span>Biografía</span>
        </div>
        <textarea
          value={bio}
          onChange={(e) => onBioChange(e.target.value)}
          rows={5}
          placeholder="Escribe una breve biografía..."
          className="w-full bg-[#1c1c1c] border border-white/10 rounded-2xl p-4 text-xs text-zinc-300 font-normal leading-relaxed focus:outline-none focus:border-[#CCD999] transition-all resize-none shadow-inner"
        />
      </div>

      <div className="flex items-center justify-between text-xs pt-2 border-t border-white/5">
        <span className="font-semibold text-zinc-400 shrink-0">Fecha de creación</span>
        <div className="flex-1 border-b border-dotted border-zinc-800 mx-3" />
        <span className="text-zinc-300 font-bold shrink-0">{createdAt}</span>
      </div>
    </section>
  );
}