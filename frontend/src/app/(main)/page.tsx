'use client';

import { useRef } from "react";
import { Search, Shield, Heart, BadgeCheck, Sparkles, Star, Activity } from "lucide-react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import logoFamTree from "@/assets/logo-famtree.png";
import NotificationsPopover from "../../components/shared/Notification";
import EmergencyBar from "@/components/shared/EmergencyBar";

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Control de scroll global para el Parallax
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Transformaciones Parallax refinadas
  const heroBgY = useTransform(scrollYProgress, [0, 0.4], ["0%", "15%"]);
  const heroTextY = useTransform(scrollYProgress, [0, 0.3], ["0%", "25%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.22], [1, 0]);
  
  const cardFloatY1 = useTransform(scrollYProgress, [0.15, 0.55], ["25px", "-20px"]);
  const cardFloatY2 = useTransform(scrollYProgress, [0.15, 0.55], ["-15px", "25px"]);
  
  const greenCardY1 = useTransform(scrollYProgress, [0.45, 0.85], ["20px", "-25px"]);
  const greenCardY2 = useTransform(scrollYProgress, [0.45, 0.85], ["-20px", "20px"]);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full bg-[#0e0e0e] text-white overflow-x-hidden selection:bg-[#CCD999] selection:text-black font-montserrat"
    >
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

      {/* ================= SECCIÓN 1: HERO CON COLLAGE DE FRANJAS VERTICALES ================= */}
      <section className="relative isolate w-full h-screen overflow-hidden flex flex-col justify-between p-8 pl-28 md:pl-32 shadow-2xl">
        
        {/* Fondo de Franjas Verticales con Parallax */}
        <motion.div 
          style={{ y: heroBgY }} 
          className="absolute inset-0 z-0 w-full h-[115%] grid grid-cols-4 md:grid-cols-6 gap-1 p-0.5"
        >
          {/* Franja 1 */}
          <div className="relative w-full h-full overflow-hidden">
            <Image 
              src="https://i.pinimg.com/1200x/ac/ce/90/acce902c7c7fbaa6eb5262f6ef0be0f0.jpg" 
              alt="Cuidado Gerriátrico" fill unoptimized className="object-cover object-center" 
            />
          </div>
          {/* Franja 2 */}
          <div className="relative w-full h-full overflow-hidden">
            <Image 
              src="https://i.pinimg.com/736x/58/94/2e/58942ec90f429505b5705344aa666c62.jpg" 
              alt="Acompañamiento Humano" fill unoptimized className="object-cover object-center" 
            />
          </div>
          {/* Franja 3 */}
          <div className="relative w-full h-full overflow-hidden">
            <Image 
              src="https://i.pinimg.com/736x/de/e2/5a/dee25abd9c16f4aae93b50592064f9ad.jpg" 
              alt="Bienestar y Convivencia" fill unoptimized className="object-cover object-center" 
            />
          </div>
          {/* Franja 4 */}
          <div className="relative w-full h-full overflow-hidden">
            <Image 
              src="https://i.pinimg.com/736x/da/c7/d1/dac7d1fa6bccd930c541936a878f25ed.jpg" 
              alt="Espacios Recreativos" fill unoptimized className="object-cover object-center" 
            />
          </div>
          {/* Franja 5 */}
          <div className="hidden md:block relative w-full h-full overflow-hidden">
            <Image 
              src="https://i.pinimg.com/736x/bc/ad/7b/bcad7b6bae84d0c95978624127045065.jpg" 
              alt="Atención Médica" fill unoptimized className="object-cover object-center" 
            />
          </div>
          {/* Franja 6 */}
          <div className="hidden md:block relative w-full h-full overflow-hidden">
            <Image 
              src="https://i.pinimg.com/1200x/20/c3/ce/20c3ce16dc4873b95b7593e101e94a1e.jpg" 
              alt="Tranquilidad Familiar" fill unoptimized className="object-cover object-center" 
            />
          </div>
        </motion.div>

        {/* Capa de oscurecimiento optimizada para lectura impecable */}
        <div className="absolute inset-0 bg-black/65 backdrop-contrast-125 z-10 pointer-events-none" />

        {/* Header superior */}
        <header className="relative z-50 flex justify-end items-center gap-6">
          <NotificationsPopover variant="glass" />

          <div className="w-110 h-11 flex items-center justify-between bg-white/5 backdrop-blur-md px-4 py-2 rounded-xl border border-white/50">
            <input
              type="text"
              placeholder="¿Qué quieres encontrar?"
              className="bg-transparent border-none outline-none text-sm placeholder-zinc-300 w-full pr-2 font-montserrat"
            />
            <button className="bg-[#161616] w-28 h-8 rounded-lg cursor-pointer text-white flex items-center justify-center gap-2 px-3 hover:bg-[#CCD999] hover:text-zinc-950 transition-colors shrink-0">
              <Search className="w-4 h-4" />
              <span className="text-xs font-bold font-montserrat">Buscar</span>
            </button>
          </div>

          <div className="flex flex-col items-center">
            <Image
              src={logoFamTree}
              alt="Logo FamTree"
              className="w-21 h-21 object-contain"
            />
          </div>
        </header>

        {/* Hero Central */}
        <motion.main 
          style={{ y: heroTextY, opacity: heroOpacity }}
          className="relative z-20 text-center my-auto max-w-3xl mx-auto space-y-4"
        >
          <h1 className="text-6xl md:text-7xl font-montserrat font-normal tracking-wide leading-tight">
            El Mejor Lugar <br /> Para Descansar
          </h1>
          <p className="text-sm text-zinc-300 max-w-md mx-auto font-montserrat font-light leading-relaxed">
            esto solo es un texto generico de fondo, no contiene ninguna informacion relevante
          </p>
        </motion.main>

        {/* Footer / Botón Inferior en z-20 */}
        <footer className="relative z-20 flex justify-center pb-4">
          <EmergencyBar />
        </footer>
      </section>

      {/* ================= SECCIÓN 2: CUIDADO CON ESTÁNDARES DE EXCELENCIA ================= */}
      <section className="relative w-full py-24 px-8 pl-28 md:pl-32 bg-[#111111] min-h-screen flex items-center">
        <div className="max-w-6xl mx-auto w-full space-y-12">
          
          <motion.h2 
            initial={{ opacity: 0, y: -15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold tracking-tight leading-tight text-white"
          >
            Cuidado Con Estándares <br /> De Excelencia
          </motion.h2>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Izquierda: Tarjetas Minimalistas en Cascada */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-4 items-start max-w-sm">
              <div className="pt-10">
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  viewport={{ once: true }}
                  className="relative p-5 rounded-2xl bg-[#161616] border border-white/10 text-center flex flex-col items-center space-y-3 overflow-hidden transition-all duration-300 hover:border-white/20"
                >
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-[#CCD999]/15 to-transparent pointer-events-none" />
                  <Shield className="w-8 h-8 text-white stroke-[1.5] mt-1 relative z-10" />
                  <h3 className="text-xs font-bold text-white relative z-10">
                    Seguridad Medica 24/7
                  </h3>
                  <p className="text-[10px] text-zinc-400 font-light leading-relaxed relative z-10">
                    Texto informativo sobre el buen estatuto de seguridad y cuidado prolongado con los clientes
                  </p>
                </motion.div>
              </div>

              <div className="space-y-4">
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="relative p-5 rounded-2xl bg-[#161616] border border-white/10 text-center flex flex-col items-center space-y-3 overflow-hidden transition-all duration-300 hover:border-white/20"
                >
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-[#CCD999]/15 to-transparent pointer-events-none" />
                  <Heart className="w-8 h-8 text-white stroke-[1.5] mt-1 relative z-10" />
                  <h3 className="text-xs font-bold text-white relative z-10">
                    Atención Humana
                  </h3>
                  <p className="text-[10px] text-zinc-400 font-light leading-relaxed relative z-10">
                    Texto informativo sobre el buen estatuto de seguridad y cuidado prolongado con los clientes
                  </p>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  viewport={{ once: true }}
                  className="relative p-5 rounded-2xl bg-[#161616] border border-white/10 text-center flex flex-col items-center space-y-3 overflow-hidden transition-all duration-300 hover:border-white/20"
                >
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-[#CCD999]/15 to-transparent pointer-events-none" />
                  <BadgeCheck className="w-8 h-8 text-white stroke-[1.5] mt-1 relative z-10" />
                  <h3 className="text-xs font-bold text-white relative z-10">
                    Reseñas Verificadas
                  </h3>
                  <p className="text-[10px] text-zinc-400 font-light leading-relaxed relative z-10">
                    Texto informativo sobre el buen estatuto de seguridad y cuidado prolongado con los clientes
                  </p>
                </motion.div>
              </div>
            </div>

            {/* Derecha: Composición Minimalista Moderna Glassmorphism */}
            <div className="lg:col-span-7 relative h-110 flex items-center justify-center">
              {/* Tarjeta Principal */}
              <motion.div 
                style={{ y: cardFloatY1 }}
                className="relative w-80 h-90 rounded-3xl overflow-hidden border border-white/10 bg-[#161616] shadow-2xl group"
              >
                <Image 
                  src="https://i.pinimg.com/1200x/af/a8/7f/afa87fc52c4ef400aa6f4f38127e2444.jpg" 
                  alt="Instalaciones Residenciales" 
                  fill 
                  unoptimized
                  className="object-cover transition-transform duration-700 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
                
                <div className="absolute bottom-4 left-4 right-4 p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-white">Certificación Médica</p>
                    <p className="text-[9px] text-zinc-300">Residencia Verificada</p>
                  </div>
                  <div className="p-1.5 rounded-full bg-[#CCD999] text-zinc-950">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                </div>
              </motion.div>

              {/* Tarjeta Flotante Secundaria */}
              <motion.div 
                style={{ y: cardFloatY2 }}
                className="absolute right-2 sm:right-6 bottom-4 w-64 h-56 rounded-3xl overflow-hidden border border-white/15 bg-black/40 backdrop-blur-xl shadow-2xl p-2 group"
              >
                <div className="relative w-full h-full rounded-2xl overflow-hidden">
                  <Image 
                    src="https://i.pinimg.com/736x/eb/a6/ad/eba6ad974951ff2aa77838b3d810285c.jpg" 
                    alt="Atención Especializada" 
                    fill 
                    unoptimized
                    className="object-cover transition-transform duration-700 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-black/40" />
                  
                  <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-1.5 text-[9px] font-bold text-[#CCD999]">
                    <Star className="w-3 h-3 fill-[#CCD999]" />
                    <span>4.9/5 Calificación</span>
                  </div>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* ================= SECCIÓN 3: CALIDAD DE VIDA ================= */}
      <section className="relative w-full py-28 px-8 pl-28 md:pl-32 bg-[#a1b372] text-zinc-950 min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] bg-size-[16px_16px]" />

        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Tarjeta Glassmorphism Izquierda */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="lg:col-span-6 bg-black/35 backdrop-blur-xl border border-white/20 p-8 sm:p-10 rounded-3xl text-white shadow-2xl space-y-6 max-w-lg"
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Calidad de Vida
            </h2>

            <ul className="space-y-4 text-xs sm:text-sm font-light text-zinc-200 leading-relaxed">
              <li className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#CCD999] mt-2 shrink-0" />
                <span>
                  <strong className="font-bold text-white">Bienestar Integral:</strong> Planes de salud, nutrición y actividades recreativas a la medida.
                </span>
              </li>

              <li className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#CCD999] mt-2 shrink-0" />
                <span>
                  <strong className="font-bold text-white">Tranquilidad Familiar:</strong> Puntos de contacto directos y transparencia en cada perfil.
                </span>
              </li>

              <li className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#CCD999] mt-2 shrink-0" />
                <span>
                  <strong className="font-bold text-white">Comunidad Activa:</strong> Espacios diseñados para el desarrollo social y la independencia.
                </span>
              </li>
            </ul>
          </motion.div>

          {/* Derecha: Grid Arquitectónico Glassmorphism */}
          <div className="lg:col-span-6 relative h-110 flex items-center justify-center">
            <div className="grid grid-cols-2 gap-4 w-full max-w-md">
              {/* Tarjeta 1 */}
              <motion.div 
                style={{ y: greenCardY1 }}
                className="relative h-60 rounded-3xl overflow-hidden border border-black/10 bg-black/20 backdrop-blur-md p-3 shadow-xl group"
              >
                <div className="relative w-full h-full rounded-2xl overflow-hidden">
                  <Image 
                    src="https://i.pinimg.com/1200x/c9/48/42/c9484259ae85ce475af458905f09ee7e.jpg" 
                    alt="Actividad Social" 
                    fill 
                    unoptimized
                    className="object-cover transition-transform duration-500 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="text-[10px] font-bold block">Espacios Verdes</span>
                    <span className="text-[8px] text-zinc-300 block">Bienestar Natural</span>
                  </div>
                </div>
              </motion.div>

              {/* Tarjeta 2 */}
              <motion.div 
                style={{ y: greenCardY2 }}
                className="relative h-60 mt-8 rounded-3xl overflow-hidden border border-black/10 bg-black/20 backdrop-blur-md p-3 shadow-xl group"
              >
                <div className="relative w-full h-full rounded-2xl overflow-hidden">
                  <Image 
                    src="https://i.pinimg.com/1200x/e4/8d/14/e48d14d3ea212caf8916880fb2ce901a.jpg" 
                    alt="Espacios Recreativos" 
                    fill 
                    unoptimized
                    className="object-cover transition-transform duration-500 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="text-[10px] font-bold block">Comunidad Viva</span>
                    <span className="text-[8px] text-zinc-300 block">Interacción Diaria</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Badge de Acompañamiento Flotante */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              viewport={{ once: true }}
              className="absolute -bottom-2 bg-black/80 backdrop-blur-xl border border-white/10 px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3 text-white"
            >
              <div className="p-1.5 rounded-xl bg-[#CCD999] text-zinc-950">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold leading-tight">100% Personalizado</p>
                <p className="text-[9px] text-zinc-400">Atención centrada en el usuario</p>
              </div>
            </motion.div>
          </div>

        </div>
      </section>
    </div>
  );
}