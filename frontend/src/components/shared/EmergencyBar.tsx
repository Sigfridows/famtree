'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PhoneCall, X, Phone } from 'lucide-react';

interface EmergencyContact {
  id: number;
  phone: string;
  formattedPhone: string;
  entity: string;
}

const EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    id: 1,
    phone: '8096884433',
    formattedPhone: '809 - 688 - 4433',
    entity: 'CONAPE (Asistencia Adulto Mayor)',
  },
  {
    id: 2,
    phone: '911',
    formattedPhone: '911',
    entity: 'Sistema Nacional de Emergencias',
  },
  {
    id: 3,
    phone: '8095674286',
    formattedPhone: '809 - 567 - 4286',
    entity: 'Cruz Roja Dominicana (Socorro)',
  },
  {
    id: 4,
    phone: '8096822151',
    formattedPhone: '809 - 682 - 2151',
    entity: 'Defensa Civil Dominicana',
  },
];

export default function EmergencyBar() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="relative z-50 font-montserrat flex justify-center w-full px-4">
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          /* BARRA COMPACTA (EN REPOSO) */
          <motion.div
            key="collapsed"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={() => setIsExpanded(true)}
            className="flex items-center justify-between gap-2 p-1.5 bg-[#161616] rounded-full shadow-2xl border border-white/10 cursor-pointer group hover:border-[#CCD999]/40 transition-colors"
          >
            <div className="bg-[#CCD999] text-zinc-950 px-6 py-2.5 rounded-full text-xs font-bold tracking-wide group-hover:bg-[#b8cb83] transition-colors">
              Asistencia de Emergencia
            </div>

            <div className="w-10 h-10 bg-white text-zinc-950 rounded-full flex items-center justify-center shrink-0 shadow-md">
              <PhoneCall className="w-4 h-4 stroke-[2.2]" />
            </div>
          </motion.div>
        ) : (
          /* BARRA DESPLEGADA HORIZONTAL */
          <motion.div
            key="expanded"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="relative w-full max-w-4xl bg-[#141414] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl text-white"
          >
            {/* Cabecera */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold tracking-tight text-white">
                  Asistencia de Emergencia
                </h3>
                <span className="text-[10px] sm:text-xs font-normal text-zinc-400 block mt-0.5">
                  Líneas directas de atención prioritaria
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Cerrar emergencias"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Fila Horizontal de Contactos con Línea de Tiempo */}
            <div className="relative pt-2">
              {/* Línea horizontal continua (visible en pantallas medianas/grandes) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
                {EMERGENCY_CONTACTS.map((item) => (
                  <a
                    key={item.id}
                    href={`tel:${item.phone}`}
                    className="p-3.5 rounded-2xl bg-[#1a1a1a] border border-white/5 hover:border-[#CCD999]/50 transition-all group flex flex-col justify-between space-y-2 cursor-pointer shadow-lg hover:-translate-y-0.5"
                  >
                    {/* Indicador de Punto (Timeline Horizontal) */}
                    <div className="flex items-center justify-between">
                      <div className="w-3.5 h-3.5 rounded-full border border-zinc-500 bg-[#141414] group-hover:border-[#CCD999] group-hover:bg-[#CCD999] transition-colors" />
                      <div className="p-1 rounded-full bg-white/5 text-zinc-400 group-hover:text-[#CCD999] group-hover:bg-[#CCD999]/10 transition-colors">
                        <Phone className="w-3 h-3" />
                      </div>
                    </div>

                    {/* Número y Entidad */}
                    <div>
                      <p className="text-xs font-bold text-white tracking-wider group-hover:text-[#CCD999] transition-colors">
                        {item.formattedPhone}
                      </p>
                      <p className="text-[10px] font-light text-zinc-400 group-hover:text-zinc-200 transition-colors leading-tight mt-1">
                        {item.entity}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}