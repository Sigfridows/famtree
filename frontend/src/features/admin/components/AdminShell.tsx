"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  ShieldCheck,
  FileBarChart,
  ScrollText,
  LogOut,
  TreePine,
  Menu,
} from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { adminError } from "../api";
import { Notice } from "./AdminUI";
import type { ReactNode } from "react";

const sections = [
  ["/system-admin", "Resumen", LayoutDashboard],
  ["/system-admin/asylums", "Asilos", Building2],
  ["/system-admin/users", "Usuarios", Users],
  ["/system-admin/moderation", "Moderación", ShieldCheck],
  ["/system-admin/reports", "Reportes", FileBarChart],
  ["/system-admin/audit", "Auditoría de moderación", ScrollText],
] as const;
export default function AdminShell({ children }: { children: ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  if (isLoading)
    return (
      <p className="p-8" role="status">
        Comprobando sesión…
      </p>
    );
  if (!user)
    return (
      <div className="p-8">
        <h1>Inicia sesión para continuar</h1>
        <Link href="/login">Ir a iniciar sesión</Link>
      </div>
    );
  if (user.role !== "SYSTEM_ADMIN")
    return (
      <div className="p-8">
        <p role="alert">
          Este panel requiere una cuenta de administrador del sistema.
        </p>
        <Link
          href={user.role === "ASYLUM_ADMIN" ? "/center-admin" : "/catalog"}
        >
          Volver a mi espacio
        </Link>
      </div>
    );
  return (
    <div className="admin-app">
      <button
        className="admin-menu"
        aria-label="Mostrar navegación"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <Menu size={20} /> Menú
      </button>
      <aside className={`admin-sidebar ${open ? "is-open" : ""}`}>
        <Link href="/system-admin" className="admin-brand">
          <span>
            <TreePine size={22} />
          </span>
          FamTree <b>CORE</b>
        </Link>
        <p className="admin-nav-label">ADMINISTRACIÓN</p>
        <nav>
          {sections.map(([href, label, Icon]) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              aria-current={pathname === href ? "page" : undefined}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="admin-account">
          <strong>
            {user.firstName} {user.lastName}
          </strong>
          <small>@{user.username} · Sistema</small>
          <Link href="/profile">Mi perfil</Link>
          <Link href="/catalog">Ver sitio público</Link>
          <button
            onClick={async () => {
              try {
                await logout();
                router.replace("/catalog");
              } catch (e) {
                setError(adminError(e));
              }
            }}
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <Notice error={error} />
        {children}
      </main>
    </div>
  );
}
