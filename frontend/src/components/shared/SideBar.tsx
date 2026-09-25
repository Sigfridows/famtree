"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BookOpen,
  Truck,
  User,
  MapIcon,
  LucideIcon,
  Send,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  isModal?: boolean;
}

const navItems: NavItem[] = [
  { label: "Inicio", href: "/", icon: Home },
  { label: "Catálogo", href: "/catalog", icon: BookOpen, isModal: true },
  { label: "Mapa", href: "/map", icon: MapIcon },
  { label: "Soporte", href: "/support", icon: Truck },
  { label: "Reseñas", href: "/review", icon: Send },
  { label: "Perfil", href: "/profile", icon: User },
];

export default function SideBar() {
  const pathname = usePathname();

  // Ocultar el Sidebar en rutas de autenticación
  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  return (
    <aside className="fixed left-0 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center py-6 w-20 bg-[#161616]/95 backdrop-blur-md rounded-r-[40px] border-r border-y border-white/10 shadow-2xl">
      <nav className="flex flex-col gap-4 items-center">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative group w-11 h-11 flex items-center justify-center z-10 hover:z-20 cursor-pointer"
            >
              {/* Píldora de fondo */}
              <div
                className={`absolute left-0 top-0 h-11 rounded-full transition-all duration-300 ease-in-out flex items-center overflow-hidden pointer-events-none ${
                  isActive
                    ? "w-11 bg-[#CCDD99] text-[#161616] group-hover:w-32.5 shadow-lg"
                    : "w-11 text-zinc-400 group-hover:w-32.5 group-hover:bg-[#CCDD99] group-hover:text-[#161616]"
                }`}
              >
                <div className="w-11 h-11 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>

                <span className="pr-4 whitespace-nowrap text-xs font-bold font-montserrat opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}