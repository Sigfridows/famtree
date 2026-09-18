"use client";

import React from "react";
import Image, { StaticImageData } from "next/image";
import SearchBar from "./SearchBar";
import NotificationsPopover from "./Notification";

interface HeaderControlsProps {
  // Props de la Búsqueda
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
  logoClassName = "w-21 h-21 object-contain",
  className = "",
}: HeaderControlsProps) {
  return (
    <header className={`relative z-40 flex justify-end items-center gap-6 ${className}`}>
      <NotificationsPopover variant="light" />
      
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
        <div className="flex flex-col items-center shrink-0">
          <Image
            src={logoSrc}
            alt={logoAlt}
            className={logoClassName}
          />
          <span className="text-[11px] font-cinzel tracking-[5.5px] font-normal text-[#161616] mt-1">
            FAMTREE
          </span>
        </div>
      )}
    </header>
  );
}