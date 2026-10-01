import React from 'react';

interface PageBannerProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export default function PageBanner({ title, subtitle, className = '' }: PageBannerProps) {
  return (
    <div
      className={`relative w-full min-h-32 sm:min-h-36 flex-1 bg-linear-to-br from-[#CCDD99] via-[#C5D792] to-[#B8CC80] rounded-2xl px-7 py-6 sm:px-10 sm:py-7 overflow-hidden flex items-center justify-between border border-white/20 shadow-xs ${className}`}
    >
      {/* 1. Malla de micro-puntos minimalista */}
      <div 
        className="absolute inset-0 bg-[radial-gradient(#495622_1px,transparent_1px)] bg-size-[18px_18px] opacity-15 pointer-events-none" 
      />

      {/* 2. Resplandor de luz suave en la esquina (Ambient Glow) */}
      <div className="absolute -top-16 -right-16 w-72 h-72 bg-white/30 rounded-full blur-3xl pointer-events-none" />

      {/* 3. Trazos vectoriales ultra finos (Geometric Line Art) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-25"
        viewBox="0 0 800 200"
        fill="none"
        preserveAspectRatio="none"
      >
        <path
          d="M 350,-40 C 500,40 620,130 820,160"
          stroke="#2D3613"
          strokeWidth="1.2"
          strokeDasharray="4 4"
        />
        <path
          d="M 420,-40 C 550,50 680,100 820,110"
          stroke="#2D3613"
          strokeWidth="1"
        />
        <circle cx="740" cy="100" r="75" stroke="#2D3613" strokeWidth="0.8" />
        <circle cx="740" cy="100" r="130" stroke="#2D3613" strokeWidth="0.5" strokeDasharray="3 3" />
      </svg>

      {/* 4. Jerarquía de texto principal */}
      <div className="relative z-10 space-y-1 max-w-xl">
        {/* <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-zinc-950/10 border border-zinc-950/10 text-[10px] sm:text-[11px] font-semibold text-zinc-900 tracking-wider uppercase backdrop-blur-xs mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-800 animate-pulse" />
          Explorar Residencias
        </div> */}

        <h1 className="text-3xl sm:text-4xl md:text-[42px] font-bold text-zinc-950 tracking-tight leading-none">
          {title}
        </h1>

        {subtitle && (
          <p className="text-sm sm:text-base font-medium text-zinc-800/80 leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {/* 5. Acento sutil y minimalista en la esquina inferior derecha */}
      <div className="absolute bottom-3 right-6 z-10 hidden sm:flex items-center gap-2 bg-zinc-950/10 backdrop-blur-xs border-[0.8px] border-white px-3 py-1 rounded-lg pointer-events-none">
        {/* <span className="w-1.5 h-1.5 rounded-full bg-emerald-700" /> */}
        <span className="text-[11px] font-semibold text-[#161616] tracking-wide">
          Servicios Verificado
        </span>
      </div>
    </div>
  );
}