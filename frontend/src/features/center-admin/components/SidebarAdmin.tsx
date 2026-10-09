"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Images,
  Menu,
  TreePine,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";

const items = [
  ["/center-admin", "Resumen", LayoutDashboard],
  ["/center-admin/asylum", "Mi asilo", Building2],
  ["/center-admin/gallery", "Galería", Images],
  ["/center-admin/reviews", "Reseñas", MessageSquare],
  ["/center-admin/settings", "Mi cuenta", Settings],
] as const;

export default function SidebarAdmin() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  return (
    <>
      <button
        className="admin-menu flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-sm md:hidden cursor-pointer"
        aria-label="Mostrar navegación"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <Menu size={20} />
        <span className="text-xs font-bold">Menú</span>
      </button>

      <aside className={`admin-sidebar ${open ? "is-open" : ""}`}>
        <div className="admin-brand flex items-center gap-2 px-6 py-5 border-b border-white/10 text-white font-bold text-lg">
          <span className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400 border border-emerald-500/30">
            <TreePine size={22} />
          </span>
          FamTree <span className="text-emerald-400 font-mono text-xs px-2 py-0.5 bg-emerald-950/80 rounded-md border border-emerald-800">ASILO</span>
        </div>

        <p className="admin-nav-label px-6 pt-6 pb-2 text-[10px] font-bold uppercase tracking-widest text-emerald-400/70">
          GESTIÓN DEL CENTRO
        </p>

        <nav className="px-3 space-y-1">
          {items.map(([href, label, Icon]) => {
            const isActive = pathname === href;
            return (
              <Link
                href={href}
                key={href}
                aria-current={isActive ? "page" : undefined}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-emerald-500 text-[#062319] shadow-md shadow-emerald-950/20"
                    : "text-emerald-100/70 hover:bg-emerald-950/50 hover:text-white"
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="admin-account mt-auto p-4 mx-3 mb-4 rounded-2xl bg-emerald-950/60 border border-emerald-800/40 text-white space-y-2">
          <div>
            <strong className="block text-xs font-bold text-white">
              {user?.firstName} {user?.lastName}
            </strong>
            <small className="text-[11px] text-emerald-300/70 font-mono">
              @{user?.username} · Admin Centro
            </small>
          </div>

          <button
            onClick={async () => {
              try {
                await logout();
                router.replace("/login");
              } catch {
                setError("No se pudo cerrar sesión. Inténtalo de nuevo.");
              }
            }}
            className="w-full mt-2 py-2 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <LogOut size={15} />
            <span>Cerrar sesión</span>
          </button>
          {error && <p role="alert" className="text-rose-400 text-[11px]">{error}</p>}
        </div>
      </aside>
    </>
  );
}