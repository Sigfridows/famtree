"use client";
import Link from "next/link";
import SidebarAdmin from "@/features/center-admin/components/SidebarAdmin";
import ForcePasswordChangeModal from "@/features/center-admin/components/ForcePasswordChangeModal";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { profileService } from "@/features/profile/api/profileService";
import { useRouter } from "next/navigation";
import "../../(system-admin)/system-admin/admin.css";

export default function CenterAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, refreshSession, logout } = useAuth();
  const router = useRouter();
  if (isLoading) return <p className="p-8">Cargando sesión…</p>;
  if (!user)
    return (
      <div className="p-8">
        <Link href="/login?callbackUrl=/center-admin">
          Inicia sesión para administrar tu asilo
        </Link>
      </div>
    );
  if (user.role !== "ASYLUM_ADMIN")
    return (
      <p role="alert" className="p-8">
        Esta sección requiere una cuenta de administrador de asilo.
      </p>
    );
  return (
    <div className="admin-app">
      <SidebarAdmin />
      <main className="admin-main">
        {!user.requiresPasswordChange && children}
      </main>
      <ForcePasswordChangeModal
        isOpen={user.requiresPasswordChange}
        onExit={async () => {
          await logout();
          router.replace("/catalog");
        }}
        onPasswordChanged={async (currentPassword, newPassword) => {
          await profileService.changePassword({
            currentPassword,
            newPassword,
            confirmNewPassword: newPassword,
          });
          await refreshSession();
          router.replace("/center-admin/asylum");
        }}
      />
    </div>
  );
}
