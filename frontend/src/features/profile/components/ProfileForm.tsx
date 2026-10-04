"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ProfileInfoSection } from "../components/ProfileInfoSection";
import { PreferencesSection } from "../components/PreferencesSection";
import { ContactSection } from "../components/ContactSection";
import { PasswordModal } from "../components/PasswordModal";
import { profileService } from "../api/profileService";
import { notificationsService } from "@/features/notifications/api/notificationsService";
import { ApiError, friendlyError } from "@/lib/apiClient";
import { User, UpdateProfilePayload } from "../types/profile.types";
import { formatPhoneNumber } from "@/lib/utils";
import { Loader2, UserX, LogIn, UserPlus, LogOut, Check } from "lucide-react";

export function ProfileForm() {
  const router = useRouter();
  const { user: authUser, isLoading: isAuthLoading, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Estados locales del formulario
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
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  useEffect(() => {
    async function loadUserData() {
      if (!authUser) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const user: User = await profileService.getProfile();

        setUsername(user.username ?? "");
        setFirstName(user.firstName ?? "");
        setLastName(user.lastName ?? "");
        setAvatarUrl(user.profilePicture ?? "");
        
        setPhone(user.phone ? formatPhoneNumber(user.phone) : "");
        setEmail(user.email ?? "");
        setBio(user.description ?? "");
        setEmail(user.email ?? "");
        try {
          const preferences = await notificationsService.getPreferences();
          setNotifications(preferences.availabilityAlert || preferences.moderationAlert);
          setOffers(preferences.updateAlert);
        } catch {
          // System and center administrators do not have a preference row.
          setNotifications(false);
          setOffers(false);
        }

        setCreatedAt(
          user.createdAt
            ? new Date(user.createdAt).toLocaleDateString("es-DO")
            : ""
        );
      } catch (error) {
        console.warn("Error al cargar datos del perfil:", error);
      } finally {
        setLoading(false);
      }
    }

    if (!isAuthLoading) {
      void loadUserData();
    }
  }, [authUser, isAuthLoading]);

  const handleFileSelect = async (file: File) => {
    if (!authUser) return;
    try {
      setIsUploadingAvatar(true);
      const res = await profileService.uploadAvatar(file);
      setAvatarUrl(res.url);
    } catch (error) {
      console.error("Error al subir el avatar:", error);
      setFeedback({ type: "error", message: "No se pudo subir la imagen. Comprueba el archivo e inténtalo de nuevo." });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    if (!authUser) return;
    try {
      setSaving(true);

      if (!/^[^@\s]+@[^@\s]+\.[a-zA-Z]{2,}$/.test(email.trim())) {
        setFeedback({ type: "error", message: "Escribe un correo electrónico válido." });
        return;
      }
      if (phone && phone.replace(/\D/g, "").length !== 10) {
        setFeedback({ type: "error", message: "El teléfono debe tener 10 dígitos." });
        return;
      }
      const payload: UpdateProfilePayload = {
        firstName,
        lastName,
        phone: phone ? phone.replace(/\D/g, "") : null,
        description: bio || null,
        email: email.trim(),
      };

      await profileService.updateProfile(payload);
      setFeedback({ type: "success", message: "Tus datos se guardaron correctamente." });
    } catch (error) {
      console.error("Error al guardar los cambios:", error);
      setFeedback({ type: "error", message: error instanceof ApiError ? friendlyError(error) : "No se pudieron guardar los cambios." });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      setFeedback({ type: "error", message: "No se pudo cerrar la sesión. Inténtalo de nuevo." });
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (isAuthLoading || (authUser && loading)) {
    return (
      <div className="flex flex-col items-center justify-center py-28 gap-3 text-zinc-400 font-montserrat">
        <Loader2 className="w-8 h-8 animate-spin text-[#CCD999]" />
        <p className="text-xs font-semibold">Cargando perfil...</p>
      </div>
    );
  }

  if (!authUser) {
    return (
      <div className="bg-[#141414] rounded-3xl p-8 sm:p-12 border border-white/10 shadow-2xl max-w-2xl mx-auto text-center space-y-6 my-12 font-montserrat text-white">
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-zinc-400 border border-white/10">
          <UserX className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight">
            Estás navegando como invitado
          </h2>
          <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed font-light">
            Para acceder a la gestión de perfil, guardar datos en favoritos o recibir notificaciones, inicia sesión o crea una cuenta.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/login"
            className="w-full sm:w-auto px-6 py-2.5 bg-white/10 hover:bg-white/15 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <LogIn className="w-4 h-4" />
            <span>Iniciar Sesión</span>
          </Link>

          <Link
            href="/register"
            className="w-full sm:w-auto px-6 py-2.5 bg-[#CCD999] hover:bg-[#b8cb83] text-zinc-950 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
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
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-montserrat max-w-7xl mx-auto p-2 sm:p-4">
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
            saving={saving}
            onNotificationsToggle={() => void (async () => {
              const next = !notifications;
              try { setSaving(true); await notificationsService.updatePreferences({ availabilityAlert: next, moderationAlert: next }); setNotifications(next); setFeedback({ type: "success", message: "Preferencias de notificaciones actualizadas." }); }
              catch { setFeedback({ type: "error", message: "No se pudieron guardar las preferencias." }); }
              finally { setSaving(false); }
            })()}
            onOffersToggle={() => void (async () => {
              const next = !offers;
              try { setSaving(true); await notificationsService.updatePreferences({ updateAlert: next }); setOffers(next); setFeedback({ type: "success", message: "Preferencias de ofertas actualizadas." }); }
              catch { setFeedback({ type: "error", message: "No se pudieron guardar las preferencias." }); }
              finally { setSaving(false); }
            })()}
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

        {feedback && <div role={feedback.type === "error" ? "alert" : "status"} className={`rounded-xl border px-4 py-3 text-xs font-semibold ${feedback.type === "error" ? "border-rose-500/30 bg-rose-500/10 text-rose-200" : "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"}`}>{feedback.message}</div>}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleLogout}
              disabled={saving || isLoggingOut}
              className="bg-rose-950/40 hover:bg-rose-950/70 text-rose-300 border border-rose-800/50 px-6 py-2.5 rounded-2xl font-bold text-xs transition-all cursor-pointer shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              {isLoggingOut ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-300" />
              ) : (
                <LogOut className="w-3.5 h-3.5" />
              )}
              <span>{isLoggingOut ? "Cerrando..." : "Cerrar Sesión"}</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving || isUploadingAvatar || isLoggingOut}
              className="bg-[#CCD999] hover:bg-[#b8cb83] text-zinc-950 px-8 py-2.5 rounded-2xl font-bold text-xs transition-all cursor-pointer shadow-lg flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              <span>{saving ? "Guardando..." : "Guardar Cambios"}</span>
            </button>
          </div>
        </div>
      </main>

      <PasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSuccess={() => setFeedback({ type: "success", message: "La contraseña se actualizó correctamente." })}
      />
    </>
  );
}
