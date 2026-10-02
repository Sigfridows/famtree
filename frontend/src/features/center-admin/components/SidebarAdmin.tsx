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
        className="admin-menu"
        aria-label="Mostrar navegación"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <Menu size={20} />
        Menú
      </button>
      <aside className={`admin-sidebar ${open ? "is-open" : ""}`}>
        <Link className="admin-brand" href="/center-admin">
          <span>
            <TreePine size={22} />
          </span>
          FamTree <b>ASILO</b>
        </Link>
        <p className="admin-nav-label">GESTIÓN DEL CENTRO</p>
        <nav>
          {items.map(([href, label, Icon]) => (
            <Link
              href={href}
              key={href}
              aria-current={pathname === href ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="admin-account">
          <strong>
            {user?.firstName} {user?.lastName}
          </strong>
          <small>@{user?.username} · Asilo</small>
          <Link href="/catalog">Ver sitio público</Link>
          <button
            onClick={async () => {
              try {
                await logout();
                router.replace("/catalog");
              } catch {
                setError("No se pudo cerrar sesión. Inténtalo de nuevo.");
              }
            }}
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
          {error && <p role="alert">{error}</p>}
        </div>
      </aside>
    </>
  );
}
