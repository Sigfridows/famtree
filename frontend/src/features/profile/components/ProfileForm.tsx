"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ProfileInfoSection } from "../components/ProfileInfoSection";
import { PreferencesSection } from "../components/PreferencesSection";
import { ContactSection } from "../components/ContactSection";
import { PasswordModal } from "../components/PasswordModal";
import { profileService } from "../api/profileService";
import { User, UpdateProfilePayload } from "../types/profile.types"; // Ajusta la ruta de tus tipos
import { Loader2, UserX, LogIn, UserPlus } from "lucide-react";

export function ProfileForm() {
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Estados locales para los campos del formulario
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [city, setCity] = useState<string>("Santo Domingo");
  const [municipality, setMunicipality] = useState<string>("Los Alcarrizos");
  const [bio, setBio] = useState<string>("");
  const [notifications, setNotifications] = useState<boolean>(false);
  const [offers, setOffers] = useState<boolean>(false);
  const [createdAt, setCreatedAt] = useState<string>("");

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // 1. CARGAR DATOS DEL PERFIL AL MONTAR
  useEffect(() => {
    async function loadUserData() {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("auth_token") || localStorage.getItem("token")
          : null;

      if (!token) {
        setIsGuest(true);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const user: User = await profileService.getProfile();

        // Mapeo exacto con la interfaz User
        setUsername(user.username ?? "");
        setFirstName(user.firstName ?? "");
        setLastName(user.lastName ?? "");
        setAvatarUrl(user.profilePicture ?? "");
        setPhone(user.phone ?? "");
        setEmail(user.email ?? "");
        setBio(user.description ?? "");
        
        setCreatedAt(
          user.createdAt
            ? new Date(user.createdAt).toLocaleDateString("es-DO")
            : ""
        );
        
        setIsGuest(false);
      } catch (error) {
        console.warn("Error o usuario no autenticado:", error);
        setIsGuest(true);
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, []);

  // 2. SUBIR FOTO DE PERFIL
  const handleFileSelect = async (file: File) => {
    if (isGuest) return;
    try {
      setIsUploadingAvatar(true);
      const res = await profileService.uploadAvatar(file);
      // Asumiendo que res contiene la URL generada
      setAvatarUrl(res.url);
    } catch (error) {
      console.error("Error al subir el avatar:", error);
      alert("No se pudo subir la imagen de perfil.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // 3. GUARDAR CAMBIOS (Ajustado a UpdateProfilePayload)
  const handleSave = async () => {
    if (isGuest) return;
    try {
      setSaving(true);

      const payload: UpdateProfilePayload = {
        firstName,
        lastName,
        phone: phone || null,
        profilePicture: avatarUrl || null,
        description: bio || null,
      };

      await profileService.updateProfile(payload);
      alert("¡Perfil actualizado con éxito!");
    } catch (error) {
      console.error("Error al guardar los cambios:", error);
      alert("No se pudieron guardar los cambios.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-zinc-500">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-800" />
        <p className="text-xs font-semibold">Cargando perfil...</p>
      </div>
    );
  }

  // SI NAVEGA COMO INVITADO
  if (isGuest) {
    return (
      <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-sm border border-zinc-200/80 max-w-2xl mx-auto text-center space-y-6 my-8">
        <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto text-zinc-600">
          <UserX className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-zinc-900">
            Estás navegando como invitado
          </h2>
          <p className="text-xs text-zinc-500 max-w-md mx-auto leading-relaxed">
            Para acceder a la gestión de perfil, guardar datos en favoritos
            o recibir notificaciones, inicia sesión o crea una cuenta.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/login"
            className="w-full sm:w-auto px-6 py-2.5 bg-[#161616] hover:bg-zinc-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <LogIn className="w-4 h-4" />
            <span>Iniciar Sesión</span>
          </Link>

          <Link
            href="/register"
            className="w-full sm:w-auto px-6 py-2.5 bg-[#C5DC83] hover:bg-[#b0c872] text-zinc-900 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>Crear Cuenta</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* COLUMNA IZQUIERDA */}
        <div className="lg:col-span-6 space-y-6">
          <ProfileInfoSection
            avatarUrl={avatarUrl}
            username={username}
            firstName={firstName}
            lastName={lastName}
            isUploadingAvatar={isUploadingAvatar}
            onFileSelect={handleFileSelect}
            onRemoveAvatar={() => setAvatarUrl("")}
            onUsernameChange={setUsername}
            onFirstNameChange={setFirstName}
            onLastNameChange={setLastName}
          />

          <PreferencesSection
            notifications={notifications}
            offers={offers}
            onOpenPasswordModal={() => setIsPasswordModalOpen(true)}
            onNotificationsToggle={() => setNotifications(!notifications)}
            onOffersToggle={() => setOffers(!offers)}
          />
        </div>

        {/* COLUMNA DERECHA */}
        <div className="lg:col-span-6 space-y-6">
          <ContactSection
            phone={phone}
            email={email}
            city={city}
            municipality={municipality}
            bio={bio}
            createdAt={createdAt}
            onPhoneChange={setPhone}
            onEmailChange={setEmail}
            onCityChange={setCity}
            onMunicipalityChange={setMunicipality}
            onBioChange={setBio}
          />

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              disabled={saving}
              className="bg-[#161616] hover:bg-zinc-800 text-white px-8 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer shadow-md disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || isUploadingAvatar}
              className="bg-[#C5DC83] hover:bg-[#b0c872] text-zinc-900 px-8 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{saving ? "Guardando..." : "Guardar"}</span>
            </button>
          </div>
        </div>
      </main>

      <PasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSuccess={() => alert("Contraseña actualizada correctamente")}
      />
    </>
  );
}