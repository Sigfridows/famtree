"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ChevronDown,
  Calendar,
  CreditCard,
  HeartPulse,
  Building2,
  ShieldCheck,
  UserCheck,
  PhoneCall,
  Mail,
  MessageSquare,
  Send,
  CheckCircle2,
  HelpCircle,
  Sparkles,
} from "lucide-react";

// Categorías Rápidas de Soporte
const SUPPORT_CATEGORIES = [
  {
    id: "citas",
    icon: Calendar,
    title: "Citas y Visitas Guiadas",
    description: "Programación, reagendamiento y protocolo de visitas a centros.",
    articlesCount: 8,
  },
  {
    id: "servicios",
    icon: HeartPulse,
    title: "Cuidado y Salud",
    description: "Planes médicos, dietas personalizadas y seguimiento de salud.",
    articlesCount: 12,
  },
  {
    id: "pagos",
    icon: CreditCard,
    title: "Planes y Facturación",
    description: "Métodos de pago, mensualidades y conceptos incluidos.",
    articlesCount: 6,
  },
  {
    id: "cuenta",
    icon: UserCheck,
    title: "Perfil Familiar",
    description: "Gestión de familiares, expedientes e historial del residente.",
    articlesCount: 9,
  },
  {
    id: "centros",
    icon: Building2,
    title: "Para Asilos y Partners",
    description: "Registro de centros, publicación de plazas y administración.",
    articlesCount: 10,
  },
  {
    id: "seguridad",
    icon: ShieldCheck,
    title: "Verificación y Seguridad",
    description: "Garantías de acreditación, moderación y protección de datos.",
    articlesCount: 7,
  },
];

// Preguntas Frecuentes (FAQ)
const FAQ_ITEMS = [
  {
    id: "1",
    category: "citas",
    question: "¿Cómo puedo agendar una visita guiada a un centro gerontológico?",
    answer:
      "Puedes agendar una visita ingresando a la tarjeta del centro de tu interés y haciendo clic en 'Solicitar Cita'. Selecciona el día y la hora disponibles. Recibirás una confirmación por correo y en tu panel de notificaciones.",
  },
  {
    id: "2",
    category: "servicios",
    question: "¿Qué documentación médica se requiere para el ingreso de un adulto mayor?",
    answer:
      "Se solicita el expediente médico actualizado, historia clínica de padecimientos preexistentes, tarjeta de vacunación y la prescripción vigente de medicamentos administrados por su médico de cabecera.",
  },
  {
    id: "3",
    category: "pagos",
    question: "¿Qué servicios están incluidos dentro de la tarifa mensual?",
    answer:
      "Por lo general, la mensualidad abarca alojamiento, alimentación balanceada (3 comidas + meriendas), asistencia de enfermería 24/7, lavandería, y actividades recreativas/cognitivas. Servicios especializados (fisioterapia avanzada o medicamentos) se detallan en cada centro.",
  },
  {
    id: "4",
    category: "seguridad",
    question: "¿Cómo verifica FamTree la calidad de las residencias asociadas?",
    answer:
      "Todos los centros en nuestra plataforma pasan por una auditoría técnica que valida sus licencias de salud, infraestructura adaptada (rampas, pasamanos, botones de pánico) y credenciales del personal médico antes de ser aprobados.",
  },
  {
    id: "5",
    category: "centros",
    question: "¿Cómo puedo registrar mi residencia o asilo en la plataforma?",
    answer:
      "Haz clic en el apartado 'Para Asilos / Registrar Centro' en el menú o comunícate con nuestro equipo corporativo. Evaluaremos tu solicitud en menos de 48 horas laborables.",
  },
  {
    id: "6",
    category: "citas",
    question: "¿Puedo cancelar o reagendar una visita sin penalización?",
    answer:
      "Sí, puedes cancelar o cambiar la fecha de tu cita hasta 2 horas antes de la hora pautada a través de tu panel de 'Mis Solicitudes' o mediante la notificación recibida.",
  },
];

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<string | null>("1");

  // Form State
  const [ticketSent, setTicketSent] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "Consulta General",
    message: "",
  });

  // Filtrado de FAQs según búsqueda y categoría
  const filteredFaqs = FAQ_ITEMS.filter((item) => {
    const matchesSearch =
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? item.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    setTicketSent(true);
    setTimeout(() => {
      setTicketSent(false);
      setFormData({ name: "", email: "", subject: "Consulta General", message: "" });
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-[#121315] text-white font-sans selection:bg-[#CCD999] selection:text-zinc-950 pb-20">
      {/* 1. HERO SECTION: Buscador Principal */}
      <section className="relative w-full py-20 px-6 sm:px-12 flex flex-col items-center justify-center border-b border-white/5 bg-linear-to-b from-[#181a1d] to-[#121315]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-62.5 bg-[#CCD999]/10 blur-[120px] rounded-full pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#CCD999] text-xs font-semibold mb-6 backdrop-blur-md"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Centro de Ayuda FamTree</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-6xl font-light text-center max-w-3xl leading-tight mb-4"
        >
          ¿Cómo podemos <span className="font-semibold text-white">ayudarte hoy?</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-zinc-400 text-sm sm:text-base text-center max-w-xl mb-10 font-light"
        >
          Encuentra orientación rápida sobre visitas, planes de residencia, requisitos médicos y asistencia familiar.
        </motion.p>

        {/* Buscador Integrado */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-2xl relative"
        >
          <div className="flex items-center bg-white/5 backdrop-blur-2xl border border-white/15 rounded-2xl p-2 shadow-2xl focus-within:border-[#CCD999]/80 transition-all">
            <Search className="w-5 h-5 text-zinc-400 ml-3 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Escribe tu duda (ej: cita guiada, requisitos médicos, mensualidad)..."
              className="w-full bg-transparent border-none outline-none text-sm text-white placeholder-zinc-400 px-3 py-2 font-normal"
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

      <div className="max-w-6xl mx-auto px-6 sm:px-10 pt-16 space-y-20">
        {/* 2. CATEGORÍAS POPULARES */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Temas de Ayuda</h2>
              <p className="text-xs text-zinc-400 mt-1">Explora por área de interés para agilizar tu consulta</p>
            </div>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-xs text-[#CCD999] hover:underline cursor-pointer self-start sm:self-auto"
              >
                Ver todas las categorías
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SUPPORT_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;

              return (
                <motion.div
                  key={cat.id}
                  whileHover={{ y: -4 }}
                  onClick={() => setSelectedCategory(isSelected ? null : cat.id)}
                  className={`p-6 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "bg-[#CCD999]/10 border-[#CCD999] shadow-[0_0_25px_rgba(204,217,153,0.15)]"
                      : "bg-white/3 border-white/10 hover:border-white/20 hover:bg-white/5"
                  }`}
                >
                  <div>
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                        isSelected ? "bg-[#CCD999] text-zinc-950" : "bg-white/10 text-[#CCD999]"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-white mb-1.5">{cat.title}</h3>
                    <p className="text-xs text-zinc-400 font-light leading-relaxed">{cat.description}</p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-500 font-medium">
                    <span>{cat.articlesCount} artículos</span>
                    <span className="text-[#CCD999] font-semibold">Explorar &rarr;</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* 3. PREGUNTAS FRECUENTES (FAQ ACCORDION) */}
        <section className="bg-white/2 border border-white/10 rounded-3xl p-6 sm:p-10 backdrop-blur-xl">
          <div className="mb-8">
            <div className="flex items-center gap-2 text-[#CCD999] text-xs font-bold mb-1 uppercase tracking-wider">
              <HelpCircle className="w-4 h-4" />
              <span>Respuesta Inmediata</span>
            </div>
            <h2 className="text-2xl font-bold">Preguntas Frecuentes</h2>
          </div>

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
                      className="w-full flex items-center justify-between p-5 text-left font-medium text-sm sm:text-base text-zinc-100 cursor-pointer gap-4"
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
              <div className="text-center py-12 text-zinc-400 text-sm">
                No se encontraron respuestas para tu búsqueda. Intenta con otras palabras o contáctanos directamente.
              </div>
            )}
          </div>
        </section>

        {/* 4. CANALES DE ATENCIÓN DIRECTA Y ASISTENCIA DE EMERGENCIA */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Lado Izquierdo: Opciones directas */}
          <div className="lg:col-span-5 space-y-4">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">¿Necesitas ayuda directa?</h2>
              <p className="text-xs text-zinc-400 font-light">
                Nuestro equipo de atención al cliente y coordinadores de cuidados están disponibles para guiarte.
              </p>
            </div>

            {/* Card Emergencia Verde FamTree */}
            <div className="p-6 rounded-2xl bg-linear-to-br from-[#CCD999] to-[#9db84a] text-zinc-950 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider bg-zinc-950/10 px-3 py-1 rounded-full">
                  Atención Prioritaria
                </span>
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Línea de Asistencia Inmediata</h3>
                <p className="text-xs mt-1 font-medium text-zinc-900/80">
                  Para consultas urgentes de disponibilidad, traslados o emergencias familiares.
                </p>
              </div>
              <div className="pt-2 flex items-center justify-between">
                <span className="text-lg font-black tracking-tight">+1 (809) 555-0199</span>
                <a
                  href="tel:8095550199"
                  className="bg-zinc-950 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-zinc-800 transition-colors shadow-md"
                >
                  Llamar Ahora
                </a>
              </div>
            </div>

            {/* Chat & Email Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              <div className="p-4 rounded-2xl bg-white/3 border border-white/10 flex items-center gap-3.5">
                <div className="p-2.5 rounded-xl bg-white/5 text-[#CCD999]">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Chat en Vivo</h4>
                  <p className="text-[11px] text-zinc-400">Lun - Vie | 8:00 AM - 7:00 PM</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/3 border border-white/10 flex items-center gap-3.5">
                <div className="p-2.5 rounded-xl bg-white/5 text-[#CCD999]">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Correo Electrónico</h4>
                  <p className="text-[11px] text-zinc-400">soporte@famtree.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Lado Derecho: Formulario de Ticket / Solicitud */}
          <div className="lg:col-span-7 bg-white/3 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl">
            <h3 className="text-lg font-bold mb-1">Envíanos un mensaje</h3>
            <p className="text-xs text-zinc-400 font-light mb-6">
              Déjanos tu consulta y un especialista en atención a familias te responderá en breve.
            </p>

            {ticketSent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 rounded-2xl bg-[#CCD999]/10 border border-[#CCD999]/30 text-center space-y-3"
              >
                <CheckCircle2 className="w-12 h-12 text-[#CCD999] mx-auto" />
                <h4 className="text-base font-bold text-white">¡Mensaje Enviado con Éxito!</h4>
                <p className="text-xs text-zinc-300 font-light max-w-sm mx-auto">
                  Hemos recibido tu solicitud. Un asesor de FamTree te contactará a través de tu correo corporativo.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmitTicket} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-300">Nombre Completo</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ej: Juan Pérez"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-[#CCD999] transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-300">Correo Electrónico</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="correo@ejemplo.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-[#CCD999] transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300">Tipo de Asunto</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-[#1c1e22] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#CCD999] transition-colors cursor-pointer"
                  >
                    <option value="Consulta General">Consulta General de Residencias</option>
                    <option value="Agendamiento de Cita">Problemas con Agendamiento de Cita</option>
                    <option value="Facturacion">Dudas de Pagos o Mensualidad</option>
                    <option value="Registro de Centro">Soy Administrador de un Asilo / Centro</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300">Mensaje o Detalle</label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Escribe aquí tu consulta o inconveniente..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-[#CCD999] transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#CCD999] hover:bg-[#b8c87e] text-zinc-950 font-bold py-3 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-lg"
                >
                  <Send className="w-4 h-4" />
                  <span>Enviar Mensaje de Soporte</span>
                </button>
              </form>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}