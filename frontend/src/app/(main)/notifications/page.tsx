"use client";
import {useEffect} from "react";
import {useRouter} from "next/navigation";
import {useAuth} from "@/features/auth/hooks/useAuth";
import {useNotifications} from "@/features/notifications/hooks/useNotifications";

export default function NotificationsPage() {
  const {isAuthenticated, isLoading, user} = useAuth();
  const router = useRouter();
  const {notifications, loading, markAsRead, markAllAsRead} = useNotifications();
  useEffect(() => {if (!isLoading && !isAuthenticated) router.replace("/login?callbackUrl=%2Fnotifications");}, [isAuthenticated, isLoading, router]);
  if (isLoading || !isAuthenticated) return <p role="status">Comprobando sesión…</p>;
  if (user?.role !== "REGISTERED_USER") return <p>La bandeja personal está disponible para usuarios registrados.</p>;
  return <main className="mx-auto max-w-3xl p-6 text-white">
    <h1 className="mb-4 text-2xl font-bold">Mis notificaciones</h1>
    <button className="mb-4 rounded-xl bg-[#CCDD99] px-4 py-2 text-black" onClick={() => void markAllAsRead()}>Marcar todas como leídas</button>
    {loading ? <p role="status">Cargando notificaciones…</p> : notifications.length === 0 ? <p>No tienes notificaciones.</p> : <ul className="space-y-3">{notifications.map(item => <li key={item.id} className="rounded-xl border border-white/15 bg-zinc-900 p-4"><h2 className="font-bold">{item.title}</h2><p>{item.description}</p><time>{item.createdAtDate.toLocaleString("es-DO")}</time>{item.isUnread && <button className="ml-4 underline" onClick={() => void markAsRead(item.rawId)}>Marcar como leída</button>}</li>)}</ul>}
  </main>;
}
