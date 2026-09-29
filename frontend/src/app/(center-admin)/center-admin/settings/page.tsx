"use client";
import { useState } from "react";
import { useProfile } from "@/features/profile/hooks/useProfile";
import { PasswordModal } from "@/features/profile/components/PasswordModal";
import { useAuth } from "@/features/auth/hooks/useAuth";
export default function AdminSettingsPage() {
  const {profile, loading, saving, error, updateProfile, uploadAvatar} = useProfile();
  const {refreshSession} = useAuth();
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [message, setMessage] = useState("");
  if (loading) return <p>Cargando perfil…</p>;
  if (!profile) return <p role="alert">{error || "Perfil no disponible"}</p>;
  return <div className="max-w-2xl space-y-6"><h1 className="text-2xl font-bold">Mi cuenta</h1><p>{profile.username} · {profile.email}</p>
    <form key={profile.userId} className="space-y-4 rounded-xl bg-white p-6" onSubmit={async e => {e.preventDefault(); const form = new FormData(e.currentTarget); setMessage(""); try {await updateProfile({firstName: String(form.get("firstName")), lastName: String(form.get("lastName")), phone: String(form.get("phone")) || null, description: String(form.get("description")) || null}); await refreshSession(); setMessage("Perfil guardado.");} catch {setMessage("No se pudo guardar el perfil.");}}}>
      <label className="block">Nombre<input className="block w-full border p-2" name="firstName" required minLength={2} maxLength={50} defaultValue={profile.firstName} /></label>
      <label className="block">Apellido<input className="block w-full border p-2" name="lastName" required minLength={2} maxLength={50} defaultValue={profile.lastName} /></label>
      <label className="block">Teléfono<input className="block w-full border p-2" name="phone" pattern="[0-9]{10}" defaultValue={profile.phone ?? ""} /></label>
      <label className="block">Biografía<textarea className="block w-full border p-2" name="description" maxLength={250} defaultValue={profile.description ?? ""} /></label>
      <button disabled={saving} className="rounded-xl bg-emerald-900 p-3 text-white">Guardar perfil</button>
    </form>
    <label className="block">Foto de perfil<input type="file" accept="image/jpeg,image/png" disabled={saving} onChange={async e => {const file = e.target.files?.[0]; e.target.value = ""; if (!file) return; try {await uploadAvatar(file); await refreshSession(); setMessage("Foto actualizada.");} catch {setMessage("No se pudo subir la foto.");}}} /></label>
    {error && <p role="alert">{error}</p>}{message && <p role="status">{message}</p>}
    <button className="underline" onClick={() => setPasswordOpen(true)}>Cambiar contraseña</button>
    <PasswordModal isOpen={passwordOpen} onClose={() => setPasswordOpen(false)} onSuccess={() => {setMessage("Contraseña actualizada."); void refreshSession();}} />
  </div>;
}
