"use client";

import { useState } from "react";
import SidebarAdmin from "@/features/center-admin/components/SidebarAdmin";
import ForcePasswordChangeModal from "@/features/center-admin/components/ForcePasswordChangeModal";

export default function CenterAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mustChangePassword, setMustChangePassword] = useState(false);

  const handlePasswordChanged = async () => {
    // Lógica para actualizar contraseña en backend
    setMustChangePassword(false);
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-800 font-sans antialiased relative">
      {/* Sidebar Fijo Verde Bosque */}
      <SidebarAdmin />

      {/* Área de Trabajo Clara */}
      <main className="flex-1 p-8 overflow-y-auto min-h-screen">
        {children}
      </main>

      {/* Modal Bloqueante */}
      <ForcePasswordChangeModal
        isOpen={mustChangePassword}
        onPasswordChanged={handlePasswordChanged}
      />
    </div>
  );
}