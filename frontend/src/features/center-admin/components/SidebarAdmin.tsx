"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import logoFamTree from "@/assets/logo-famtree.png";
import {
  Building2,
  LayoutDashboard,
  MessageSquare,
  Settings,
  ExternalLink,
  LogOut,
  ChevronRight,
} from "lucide-react";

const navItems = [
  {
    name: "Dashboard",
    href: "/center-admin",
    icon: LayoutDashboard,
    exact: true,
  },
  { name: "Mi Asilo", href: "/center-admin/asylum", icon: Building2 },
  {
    name: "Reseñas/Feedback",
    href: "/center-admin/reviews",
    icon: MessageSquare,
  },
  { name: "Configuración", href: "/center-admin/settings", icon: Settings },
];

export default function SidebarAdmin() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string, exact?: boolean) => {
    return exact ? pathname === href : pathname.startsWith(href);
  };

  return (
    <aside className="w-64 bg-[#062319] text-emerald-100 flex flex-col justify-between shrink-0 min-h-screen sticky top-0 h-screen select-none border-r border-emerald-900/40">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-emerald-900/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/20">
              <Image
                src={logoFamTree}
                alt="Logo FamTree"
                className="w-21 h-21 object-contain"
              />
            </div>
            <div>
              <h2 className="font-bold text-sm tracking-wide text-white">
                Panel del Control
              </h2>
              <p className="text-xs text-emerald-300/70">Gestión del Centro</p>
            </div>
          </div>
        </div>

        {/* Menu Nav */}
        <div className="p-4 space-y-1">
          <p className="px-3 text-[10px] font-bold text-emerald-400/70 uppercase tracking-widest mb-3">
            Menú Principal
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = isActive(item.href, item.exact);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    active
                      ? "bg-[#0e3b2c] text-white font-semibold border border-emerald-500/30 shadow-sm"
                      : "text-emerald-200/70 hover:text-white hover:bg-emerald-900/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${active ? "text-emerald-400" : "text-emerald-300/60"}`}
                    />
                    <span>{item.name}</span>
                  </div>
                  {active && (
                    <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-emerald-900/40 space-y-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-emerald-200/70 hover:text-white hover:bg-emerald-900/30 transition-all"
        >
          <ExternalLink className="w-4 h-4 text-emerald-300/60" />
          <span>Ver sitio público</span>
        </Link>

        <button
          onClick={() => router.push("/login")}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-rose-300 hover:bg-rose-950/40 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
