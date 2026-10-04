'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Home, Building, Building2, Check, RotateCcw, Eye, Hotel
} from 'lucide-react';
import CustomSelect from '../../../components/shared/CustomSelect';

export interface FilterData {
  type?: string;
  services?: string[];
  maxPrice?: number;
  province?: string;
  municipality?: string;
  certifiedOnly?: boolean;
  minRatingOnly?: boolean;
}

interface FilterModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onApply?: (filters: FilterData) => void;
  servicesList?: string[];
}

const PROPERTY_TYPES = [
  { id: 'casa', label: 'Casa', icon: Home },
  { id: 'apartamento', label: 'Apt.', icon: Building },
  { id: 'villa', label: 'Villa', icon: Building2 },
  { id: 'geriatrico', label: 'Geriátrico', icon: Hotel },
];

const DEFAULT_SERVICES = [
  'Alimentación', 'Rampas Accesibles', 'Terapia', 'Seguridad 24/7', 'Áreas Verdes', 'Supervisión',
];

const PROVINCES = ['Santo Domingo', 'Santiago', 'Puerto Plata', 'La Vega', 'San Cristóbal'];
const MUNICIPALITIES_BY_PROVINCE: Record<string, string[]> = {
  'Santo Domingo': ['Pedro Brand', 'Distrito Nacional', 'Boca Chica', 'Santo Domingo Este'],
  'Santiago': ['Santiago de los Caballeros', 'Tamboril', 'Puñal'],
  'Puerto Plata': ['Puerto Plata', 'Sosúa', 'Cabarete'],
  'La Vega': ['Concepción de La Vega', 'Jarabacoa', 'Constanza'],
  'San Cristóbal': ['San Cristóbal', 'Bajos de Haina', 'Villa Altagracia'],
};

export default function FilterModal({ isOpen = false, onClose, onApply, servicesList }: FilterModalProps) {
  const [selectedType, setSelectedType] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [price, setPrice] = useState(50000);
  const [province, setProvince] = useState('Santo Domingo');
  const [municipality, setMunicipality] = useState('Pedro Brand');
  const [certifiedOnly, setCertifiedOnly] = useState(false);
  const [minRatingOnly, setMinRatingOnly] = useState(false);

  const activeServices = servicesList && servicesList.length > 0 ? servicesList : DEFAULT_SERVICES;
  const availableMunicipalities = MUNICIPALITIES_BY_PROVINCE[province] || [];

  const toggleService = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]
    );
  };

  const handleReset = () => {
    setSelectedType(''); setSelectedServices([]); setPrice(50000);
    setProvince('Santo Domingo'); setMunicipality('Pedro Brand');
    setCertifiedOnly(false); setMinRatingOnly(false);
  };

  const handleApply = () => {
    onApply?.({ type: selectedType || undefined, services: selectedServices, maxPrice: price, province, municipality, certifiedOnly, minRatingOnly });
    onClose?.();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop totalmente transparente: permite cerrar al hacer clic afuera sin oscurecer */}
        <div 
          className="fixed inset-0 z-40 bg-transparent" 
          onClick={onClose} 
        />

          {/* Panel de Filtros anclado directamente debajo del botón */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            className="absolute right-0 top-full mt-2 z-50 w-[92vw] sm:w-135 md:w-155 bg-[#161616] rounded-3xl shadow-2xl text-white font-montserrat p-5 space-y-4 border border-zinc-800 origin-top-right"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800">
              <h2 className="text-base sm:text-lg font-bold text-white">Filtros</h2>
              <button 
                type="button" 
                onClick={onClose} 
                className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-zinc-400">Tipo de Propiedad</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedType('')}
                      className={`flex flex-col items-center justify-center p-1.5 h-14 rounded-2xl border transition-all text-center cursor-pointer ${!selectedType ? 'border-[#CCDD99] bg-[#CCDD99]/10 text-[#CCDD99] shadow-sm' : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/50 text-zinc-400'}`}
                    >
                      <span className="text-[10px] font-semibold">Todos</span>
                    </button>
                    {PROPERTY_TYPES.map((type) => {
                      const Icon = type.icon;
                      const isSelected = selectedType === type.id;
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setSelectedType(type.id)}
                          className={`flex flex-col items-center justify-center p-1.5 h-14 rounded-2xl border transition-all text-center cursor-pointer ${
                            isSelected
                              ? 'border-[#CCDD99] bg-[#CCDD99]/10 text-[#CCDD99] shadow-sm'
                              : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/50 text-zinc-400'
                          }`}
                        >
                          <Icon className="w-4 h-4 mb-1" />
                          <span className="text-[10px] font-semibold leading-tight">{type.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-zinc-400">Ubicación</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <CustomSelect
                      options={PROVINCES} value={province}
                      onChange={(val) => {
                        setProvince(val);
                        setMunicipality(MUNICIPALITIES_BY_PROVINCE[val]?.[0] || '');
                      }}
                    />
                    <CustomSelect options={availableMunicipalities} value={municipality} onChange={setMunicipality} />
                  </div>
                </div>

                <div className="space-y-2.5 pt-1">
                  <h3 className="text-xs font-semibold text-zinc-400">Opciones</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-zinc-200">Certificación</p>
                      <p className="text-[10px] text-zinc-500">Solo asilos verificados</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCertifiedOnly(!certifiedOnly)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        certifiedOnly ? 'bg-[#CCDD99]' : 'bg-zinc-800'
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-zinc-950 shadow-lg ring-0 transition duration-200 ease-in-out ${certifiedOnly ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between border-t border-zinc-800 pt-2">
                    <div>
                      <p className="text-xs font-semibold text-zinc-200">Calificación Mínima</p>
                      <p className="text-[10px] text-zinc-500">Solo calificaciones superiores</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMinRatingOnly(!minRatingOnly)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        minRatingOnly ? 'bg-[#CCDD99]' : 'bg-zinc-800'
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-zinc-950 shadow-lg ring-0 transition duration-200 ease-in-out ${minRatingOnly ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <h3 className="text-xs font-semibold text-zinc-400">Precio Máximo</h3>
                  <p className="text-base font-bold text-white tracking-tight">RD$ {price.toLocaleString()}</p>
                  <div className="relative pt-1">
                    <input
                      type="range" min="500" max="50000" step="250" value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#CCDD99]"
                    />
                    <div className="flex justify-between text-[10px] text-zinc-500 font-medium pt-1">
                      <span>RD$ 500</span><span>RD$ 50,000+</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-zinc-400">Servicios Incluidos</h3>
                  <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1">
                    {activeServices.map((service) => {
                      const isChecked = selectedServices.includes(service);
                      return (
                        <button
                          key={service} 
                          type="button"
                          onClick={() => toggleService(service)}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[11px] font-semibold transition-all cursor-pointer ${
                            isChecked
                              ? 'border-[#CCDD99] bg-[#CCDD99]/10 text-[#CCDD99]'
                              : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-600'
                          }`}
                        >
                          <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border transition-all ${
                            isChecked ? 'bg-[#CCDD99] border-[#CCDD99] text-zinc-950' : 'border-zinc-600'
                          }`}>
                            {isChecked && <Check className="w-2.5 h-2.5 stroke-3" />}
                          </div>
                          <span>{service}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] border border-zinc-700 text-xs font-bold text-zinc-300 hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <span>Restablecer</span><RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="flex items-center gap-1.5 px-6 py-2 rounded-[10px] bg-[#CCDD99] text-zinc-950 text-xs font-bold hover:bg-[#b8cb83] transition-colors cursor-pointer"
              >
                <span>Aplicar selección</span><Eye className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
