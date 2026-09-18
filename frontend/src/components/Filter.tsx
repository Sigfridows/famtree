'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Home, 
  Building, 
  Building2, 
  Check, 
  RotateCcw, 
  Eye, 
  Hotel
} from 'lucide-react';
import CustomSelect from './shared/CustomSelect';

interface FilterModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onApply?: (filters: unknown) => void;
}

const PROPERTY_TYPES = [
  { id: 'casa', label: 'Casa', icon: Home },
  { id: 'apartamento', label: 'Apartamento', icon: Building },
  { id: 'villa', label: 'Villa', icon: Building2 },
  { id: 'geriatrico', label: 'Geriatrico', icon: Hotel },
];

const SERVICES_LIST = [
  'Alimentacion',
  'Rampas Accesibles',
  'Terapia',
  'Seguridad 24/7',
  'Areas Verdes',
  'Supervision',
];

export default function FilterModal({ isOpen = true, onClose, onApply }: FilterModalProps) {
  const [selectedType, setSelectedType] = useState('geriatrico');
  const [selectedServices, setSelectedServices] = useState<string[]>(['Alimentacion', 'Areas Verdes']);
  const [price, setPrice] = useState(2500);
  const [location, setLocation] = useState({ province: 'Santo Domingo', municipality: 'Pedro Brand' });
  const [certifiedOnly, setCertifiedOnly] = useState(false);
  const [minRatingOnly, setMinRatingOnly] = useState(false);

  const toggleService = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]
    );
  };

  const handleReset = () => {
    setSelectedType('geriatrico');
    setSelectedServices([]);
    setPrice(5000);
    setLocation({ province: 'Santo Domingo', municipality: 'Pedro Brand' });
    setCertifiedOnly(false);
    setMinRatingOnly(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Capa invisible para detectar clics fuera */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeInOut' }}
            className="fixed inset-0 z-40 bg-transparent" 
            onClick={onClose} 
          />

          {/* Popover con entrada/salida fluida en escala y opacidad */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="absolute right-0 top-full mt-2 z-50 w-[90vw] sm:w-115 bg-white rounded-3xl shadow-2xl text-zinc-900 font-montserrat p-5 space-y-3.5 origin-top-right"
          >
            {/* Cabecera */}
            <div className="flex items-center justify-between pb-2.5 border-b border-zinc-100">
              <h2 className="text-lg font-bold">Filtros</h2>
              <button 
                onClick={onClose} 
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tipo de Propiedad */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-zinc-800">Tipo de Propiedad</h3>
              <div className="grid grid-cols-4 gap-2">
                {PROPERTY_TYPES.map((type) => {
                  const Icon = type.icon;
                  const isSelected = selectedType === type.id;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={`flex flex-col items-start justify-between p-2 h-14 rounded-2xl border transition-all text-left ${
                        isSelected
                          ? 'border-2 border-black bg-white shadow-xs'
                          : 'border-zinc-200 hover:border-zinc-300 bg-white'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-zinc-800" />
                      <span className="text-[11px] font-semibold leading-tight">{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Servicios */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-zinc-800">Servicios</h3>
              <div className="flex flex-wrap gap-2">
                {SERVICES_LIST.map((service) => {
                  const isChecked = selectedServices.includes(service);
                  return (
                    <button
                      key={service}
                      onClick={() => toggleService(service)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                        isChecked
                          ? 'border-black bg-white text-zinc-900'
                          : 'border-zinc-200 text-zinc-700 hover:border-zinc-300'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all ${
                          isChecked ? 'bg-black border-black text-white' : 'border-zinc-300'
                        }`}
                      >
                        {isChecked && <Check className="w-2.5 h-2.5 stroke-3" />}
                      </div>
                      <span className="text-[11px]">{service}</span>
                    </button>
                  );
                })}
              </div>
              <button className="text-[11px] font-bold text-[#6B7C37] hover:underline pt-0.5">
                Ver mas...
              </button>
            </div>

            {/* Precio Slider */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-semibold text-zinc-800">Precio</h3>
              <p className="text-base font-bold tracking-tight">$ 300 – ${price.toLocaleString()}</p>
              <div className="relative pt-1">
                <input
                  type="range"
                  min="300"
                  max="10000"
                  step="100"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-black"
                />
                <div className="flex justify-between text-[10px] text-zinc-400 font-medium pt-1">
                  <span>Min.</span>
                  <span>Max.</span>
                </div>
              </div>
            </div>

            {/* Ubicación */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-zinc-800">Ubicacion</h3>
              <div className="grid grid-cols-2 gap-2">
                <CustomSelect
                  options={['Santo Domingo', 'Santiago', 'Puerto Plata']}
                  value={location.province}
                  onChange={(val) => setLocation({ ...location, province: val })}
                />

                <CustomSelect
                  options={['Pedro Brand', 'Distrito Nacional', 'Boca Chica']}
                  value={location.municipality}
                  onChange={(val) => setLocation({ ...location, municipality: val })}
                />
              </div>
            </div>

            {/* Opciones (Switches) */}
            <div className="space-y-2.5 pt-1">
              <h3 className="text-xs font-semibold text-zinc-800">Opciones</h3>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-zinc-900">Certificacion</p>
                  <p className="text-[10px] text-zinc-500">Ayuda a filtrar de los asilos verificados de los que no</p>
                </div>
                <button
                  onClick={() => setCertifiedOnly(!certifiedOnly)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    certifiedOnly ? 'bg-black' : 'bg-zinc-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      certifiedOnly ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between border-t border-zinc-100 pt-2">
                <div>
                  <p className="text-xs font-semibold text-zinc-900">Calificacion Minima</p>
                  <p className="text-[10px] text-zinc-500">Ayuda a filtrar a los asilos con la calificacion minima</p>
                </div>
                <button
                  onClick={() => setMinRatingOnly(!minRatingOnly)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    minRatingOnly ? 'bg-black' : 'bg-zinc-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      minRatingOnly ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Acciones Inferiores */}
            <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] border border-zinc-200 text-xs font-bold text-zinc-800 hover:bg-zinc-50 transition-colors shadow-xs"
              >
                <span>Restablecer</span>
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onApply?.({ selectedType, selectedServices, price, location, certifiedOnly, minRatingOnly })}
                className="flex items-center gap-1.5 px-5 py-2 rounded-[10px] bg-[#CCDD99] text-zinc-950 text-xs font-bold hover:bg-[#b8cb83] transition-colors shadow-xs"
              >
                <span>Ver 136</span>
                <Eye className="w-4 h-4" />
              </button>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}