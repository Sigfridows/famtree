"use client";

import React from "react";
import Image, { StaticImageData } from "next/image";
import SearchBar from "./SearchBar";
import NotificationsPopover from "./Notification";

interface HeaderControlsProps {
  // Props de Búsqueda
  searchValue?: string;
  onSearchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch?: () => void;
  placeholder?: string;
  placeholderClass?: string;
  bgClass?: string;
  borderClass?: string;
  buttonBgClass?: string;
  buttonTextClass?: string;

  // Props del Logo
  logoSrc?: StaticImageData | string;
  logoAlt?: string;
  showLogo?: boolean;
  logoClassName?: string;

  className?: string;
}

export default function HeaderControls({
  searchValue,
  onSearchChange,
  onSearch,
  placeholder,
  placeholderClass,
  bgClass,
  borderClass,
  buttonBgClass,
  buttonTextClass,
  logoSrc,
  logoAlt = "Logo",
  showLogo = true,
  logoClassName = "w-16 h-16 object-contain",
  className = "",
}: HeaderControlsProps) {
  return (
    <header className={`relative z-40 flex items-center justify-end gap-4 sm:gap-6 ${className}`}>
      <NotificationsPopover variant="dark" />
      
      <SearchBar
        value={searchValue}
        onChange={onSearchChange}
        onSearch={onSearch}
        placeholder={placeholder}
        placeholderClass={placeholderClass}
        bgClass={bgClass}
        borderClass={borderClass}
        buttonBgClass={buttonBgClass}
        buttonTextClass={buttonTextClass}
      />

      {showLogo && logoSrc && (
        <div className="flex flex-col items-center shrink-0 transition-opacity hover:opacity-90">
          <Image
            src={logoSrc}
            alt={logoAlt}
            className={logoClassName}
          />
          <span className="text-[10px] tracking-[4px] font-normal font-cinzel text-zinc-400 uppercase -mt-0.5">
            famtree
          </span>
        </div>
      )}
    </header>
  );
}