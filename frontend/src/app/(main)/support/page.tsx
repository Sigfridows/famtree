"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, HelpCircle, Sparkles } from "lucide-react";

const FAQ_ITEMS = [
  {
    id: "1",
    question: "¿Cómo puedo agendar una visita guiada a un centro gerontológico?",
    answer:
      "Puedes agendar una visita ingresando a la tarjeta del centro de tu interés y haciendo clic en 'Solicitar Cita'. Selecciona el día y la hora disponibles. Recibirás una confirmación por correo y en tu panel de notificaciones.",
  },
  {
    id: "2",
    question: "¿Qué documentación médica se requiere para el ingreso de un adulto mayor?",
    answer:
      "Se solicita el expediente médico actualizado, historia clínica de padecimientos preexistentes, tarjeta de vacunación y la prescripción vigente de medicamentos administrados por su médico de cabecera.",
  },
  {
    id: "3",
    question: "¿Qué servicios están incluidos dentro de la tarifa mensual?",
    answer:
      "Por lo general, la mensualidad abarca alojamiento, alimentación balanceada (3 comidas + meriendas), asistencia de enfermería 24/7, lavandería, y actividades recreativas/cognitivas. Servicios especializados (fisioterapia avanzada o medicamentos) se detallan en cada centro.",
  },
  {
    id: "4",
    question: "¿Cómo verifica FamTree la calidad de las residencias asociadas?",
    answer:
      "Todos los centros en nuestra plataforma pasan por una auditoría técnica que valida sus licencias de salud, infraestructura adaptada (rampas, pasamanos, botones de pánico) y credenciales del personal médico antes de ser aprobados.",
  },
  {
    id: "5",
    question: "¿Cómo puedo registrar mi residencia o asilo en la plataforma?",
    answer:
      "Haz clic en el apartado 'Para Asilos / Registrar Centro' en el menú o comunícate con nuestro equipo corporativo. Evaluaremos tu solicitud en menos de 48 horas laborables.",
  },
  {
    id: "6",
    question: "¿Puedo cancelar o reagendar una visita sin penalización?",
    answer:
      "Sí, puedes cancelar o cambiar la fecha de tu cita hasta 2 horas antes de la hora pautada a través de tu panel de 'Mis Solicitudes' o mediante la notificación recibida.",
  },
];

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<string | null>("1");

  const filteredFaqs = FAQ_ITEMS.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#121315] text-white font-sans selection:bg-[#CCD999] selection:text-zinc-950 pb-20">
      
      {/* Scrollbar minimalista */}
      <style jsx global>{`
        ::-webkit-scrollbar {
          width: 5px;
        }
        ::-webkit-scrollbar-track {
          background: #0e0e0e;
        }
        ::-webkit-scrollbar-thumb {
          background: #222222;
          border-radius: 9999px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #ccd999;
        }
      `}</style>
      
      {/* Hero Simplificado */}
      <section className="relative w-full py-16 px-6 sm:px-12 flex flex-col items-center justify-center border-b border-white/5 bg-linear-to-b from-[#181a1d] to-[#121315]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-48 bg-[#CCD999]/10 blur-[100px] rounded-full pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#CCD999] text-xs font-semibold mb-4 backdrop-blur-md"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Centro de Ayuda FamTree</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-5xl font-bold text-center leading-tight mb-3"
        >
          Preguntas Frecuentes
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-zinc-400 text-sm sm:text-base text-center max-w-md mb-8 font-light"
        >
          Encuentra respuestas rápidas sobre visitas, servicios, requisitos y el funcionamiento de la plataforma.
        </motion.p>

        {/* Buscador de Preguntas */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25 }}
          className="w-full max-w-xl relative"
        >
          <div className="flex items-center bg-white/5 backdrop-blur-2xl border border-white/15 rounded-2xl p-2 focus-within:border-[#CCD999]/80 transition-all">
            <Search className="w-5 h-5 text-zinc-400 ml-3 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar en preguntas frecuentes..."
              className="w-full bg-transparent border-none outline-none text-sm text-white placeholder-zinc-400 px-3 py-1.5 font-normal"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-xs text-zinc-400 hover:text-white px-2 cursor-pointer"
              >
                Limpiar
              </button>
            )}
          </div>
        </motion.div>
      </section>

      {/* Lista Accordion FAQ */}
      <main className="max-w-4xl mx-auto px-6 pt-12">
        <div className="space-y-3">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => {
              const isOpen = expandedFaq === faq.id;

              return (
                <div
                  key={faq.id}
                  className="border border-white/10 rounded-2xl overflow-hidden transition-colors bg-white/2 hover:bg-white/4"
                >
                  <button
                    onClick={() => setExpandedFaq(isOpen ? null : faq.id)}
                    className="w-full flex items-center justify-between p-5 text-left font-semibold text-sm sm:text-base text-zinc-100 cursor-pointer gap-4"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-zinc-400 shrink-0 transition-transform duration-300 ${
                        isOpen ? "rotate-180 text-[#CCD999]" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                      >
                        <div className="px-5 pb-5 text-xs sm:text-sm text-zinc-400 font-light leading-relaxed border-t border-white/5 pt-4">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          ) : (
            <div className="text-center py-16 bg-white/2 border border-white/10 rounded-2xl">
              <HelpCircle className="w-10 h-10 text-zinc-500 mx-auto mb-3" />
              <p className="text-zinc-400 text-sm">
                No se encontraron preguntas que coincidan con tu búsqueda.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}