"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCheck, Loader2, Inbox } from "lucide-react";
import { useNotifications } from "../hooks/useNotifications";
import NotificationItem from "./NotificationItem";
import type { NotificationVariant } from "../types/notification.types";

interface NotificationsPopoverProps {
  variant?: NotificationVariant;
}

export default function NotificationsPopover({
  variant = "dark",
}: NotificationsPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"Hoy" | "Semana" | "Ayer">("Hoy");
  const containerRef = useRef<HTMLDivElement>(null);

  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } =
    useNotifications();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredNotifications = notifications.filter((item) => {
    const now = new Date();
    const itemDate = item.createdAtDate;
    const diffInHours = (now.getTime() - itemDate.getTime()) / (1000 * 3600);

    if (activeTab === "Hoy") return diffInHours <= 24;
    if (activeTab === "Ayer") return diffInHours > 24 && diffInHours <= 48;
    if (activeTab === "Semana") return diffInHours <= 168;
    return true;
  });

  const styles = {
    light: {
      card: "bg-white border border-zinc-200 shadow-2xl text-zinc-900",
      title: "text-zinc-900",
      link: "text-emerald-600 hover:text-emerald-700",
      tabsBg: "bg-zinc-100 border border-zinc-200/60",
      activeTab: "bg-white text-zinc-950 font-bold shadow-xs",
      inactiveTab: "text-zinc-500 hover:text-zinc-800 font-medium",
      itemHover: "hover:bg-zinc-50/80 hover:border-zinc-200/80",
      textPrimary: "text-zinc-900",
      textSecondary: "text-zinc-500",
      iconBg: "bg-zinc-100 border-zinc-200/80 text-zinc-700",
    },
    dark: {
      card: "bg-zinc-900/95 backdrop-blur-xl border border-white/10 shadow-2xl text-white",
      title: "text-zinc-100 tracking-tight",
      link: "text-[#CCDD99] hover:text-[#b8cc80]",
      tabsBg: "bg-zinc-950/60 border border-white/5",
      activeTab: "bg-white/10 text-white font-semibold shadow-xs border border-white/10",
      inactiveTab: "text-zinc-400 hover:text-zinc-200 font-medium",
      itemHover: "hover:bg-white/5 hover:border-white/10",
      textPrimary: "text-zinc-100",
      textSecondary: "text-zinc-400",
      iconBg: "bg-zinc-800/80 border-white/10 text-zinc-200",
    },
    glass: {
      card: "bg-zinc-950/90 backdrop-blur-2xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.8)] text-white rounded-2xl",
      title: "text-white font-bold tracking-tight",
      link: "text-[#CCDD99] hover:text-[#b8cb83] font-semibold transition-colors",
      tabsBg: "bg-black/50 border border-white/10 p-1 rounded-xl",
      activeTab:
        "bg-[#CCDD99] text-zinc-950 font-bold rounded-lg shadow-sm transition-all",
      inactiveTab:
        "text-zinc-400 hover:text-zinc-200 transition-colors font-medium",
      itemHover: "hover:bg-white/10 hover:border-white/15 rounded-xl transition-colors",
      textPrimary: "text-zinc-100 font-medium",
      textSecondary: "text-zinc-400 font-normal",
      iconBg:
        "bg-white/10 border-white/15 text-zinc-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]",
    },
  }[variant];

  return (
    <div className="relative z-50 inline-block" ref={containerRef}>
      {/* Botón de la Campana */}
      <motion.button
        whileTap={{ scale: 0.94 }}
        whileHover={{ scale: 1.04 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2.5 rounded-xl transition-all cursor-pointer border ${
          variant === "light"
            ? "bg-white border-zinc-200 hover:bg-zinc-50 text-zinc-800 shadow-xs"
            : "bg-zinc-900/80 border-white/10 hover:border-white/20 hover:bg-zinc-800/80 text-zinc-200 shadow-xs backdrop-blur-md"
        }`}
        aria-label="Notificaciones"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#CCDD99] opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#CCDD99] border-2 border-zinc-950" />
          </span>
        )}
      </motion.button>

      {/* Popover desplegable */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className={`absolute right-0 mt-3 w-88 sm:w-96 rounded-2xl p-5 z-50 ${styles.card}`}
          >
            {/* Cabecera */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className={`text-sm font-bold ${styles.title}`}>
                  Notificaciones
                </h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#CCDD99]/20 text-[#CCDD99] border border-[#CCDD99]/30">
                    {unreadCount} nuevas
                  </span>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className={`text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${styles.link}`}
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Marcar leídas</span>
                </button>
              )}
            </div>

            {/* Selector de Pestañas (Filtros) */}
            <div
              className={`grid grid-cols-3 p-1 rounded-xl mb-4 ${styles.tabsBg}`}
            >
              {(["Hoy", "Semana", "Ayer"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`py-1 text-[11px] rounded-lg transition-all duration-150 cursor-pointer text-center ${
                    activeTab === tab ? styles.activeTab : styles.inactiveTab
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Lista de Notificaciones */}
            <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
              {loading && (
                <div className="py-10 flex flex-col items-center justify-center text-zinc-400">
                  <Loader2 className="w-5 h-5 animate-spin mb-2 text-[#CCDD99]" />
                  <span className="text-xs">Cargando notificaciones...</span>
                </div>
              )}

              {!loading && filteredNotifications.length === 0 && (
                <div className="py-10 flex flex-col items-center justify-center text-zinc-500">
                  <Inbox className="w-8 h-8 mb-2 opacity-40" />
                  <p className="text-xs font-medium">
                    Sin notificaciones en este periodo.
                  </p>
                </div>
              )}

              {!loading &&
                filteredNotifications.map((item) => (
                  <NotificationItem
                    key={item.id}
                    item={item}
                    styles={styles}
                    onRead={markAsRead}
                  />
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}