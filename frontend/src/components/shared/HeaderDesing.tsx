import React from 'react';

interface PageBannerProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export default function PageBanner({ title, subtitle, className = '' }: PageBannerProps) {
  return (
    <div className={`relative w-full h-39 flex-1 bg-[#CCDD99] rounded-b-[10px] rounded-t-none px-6 py-6 sm:px-8 sm:py-7 overflow-hidden flex items-center justify-between min-h-30 shadow-xs ${className}`}>
      
      {/* Fondo con trazos de curvas orgánicas */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-30 mix-blend-multiply"
        viewBox="0 0 800 200"
        fill="none"
        preserveAspectRatio="none"
      >
        <path
          d="M -50,120 Q 150,-60 380,100 T 850,20"
          stroke="#6B7C37"
          strokeWidth="18"
          strokeLinecap="round"
        />
        <path
          d="M 50,220 Q 300,10 650,180 T 900,80"
          stroke="#889B48"
          strokeWidth="22"
          strokeLinecap="round"
        />
      </svg>

      {/* Texto (Título y Subtítulo) */}
      <div className="relative z-10 space-y-0.5">
        <h1 className="text-7xl sm:text-5xl font-bold text-zinc-950 tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[20px] sm:text-lg font-medium text-zinc-800">
            {subtitle}
          </p>
        )}
      </div>

      {/* Diseños de rayas en la esquina inferior derecha */}
      <div className="absolute bottom-3.5 right-6 hidden sm:flex flex-col items-end gap-1.5 pointer-events-none z-10">
        <div className="w-32 md:w-44 h-2.5 bg-zinc-950 rounded-full" />
        <div className="w-48 md:w-60 h-2.5 bg-[#5F6E31]/70 rounded-full" />
        <div className="w-36 md:w-48 h-2.5 bg-[#5F6E31]/35 rounded-full" />
      </div>

    </div>
  );
}