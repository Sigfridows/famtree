"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Star, Clock, Wrench, CheckCheck, Loader2 } from "lucide-react";
import { useNotifications } from "../hooks/useNotifications";
import type { NotificationVariant, NotificationUIItem } from "../types/notification.types";

interface NotificationsPopoverProps {
  variant?: NotificationVariant;
}

export default function NotificationsPopover({
  variant = "light",
}: NotificationsPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"Hoy" | "Semana" | "Ayer">("Hoy");
  const containerRef = useRef<HTMLDivElement>(null);

  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();

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
      card: "bg-white border border-zinc-200/80 shadow-2xl text-zinc-900",
      title: "text-zinc-900",
      link: "text-[#22c55e] hover:text-[#16a34a]",
      tabsBg: "bg-zinc-100/90",
      activeTab: "bg-white text-zinc-900 shadow-xs font-semibold",
      inactiveTab: "text-zinc-400 hover:text-zinc-600",
      itemHover: "hover:bg-zinc-50/80",
      textPrimary: "text-zinc-900",
      textSecondary: "text-zinc-400",
      divider: "border-zinc-100",
      iconBg: "bg-zinc-50 border border-zinc-200 text-zinc-700",
    },
    dark: {
      card: "bg-[#161616] border border-zinc-800 shadow-2xl text-white",
      title: "text-white",
      link: "text-[#A8E038] hover:text-[#95ca2f]",
      tabsBg: "bg-[#242424]",
      activeTab: "bg-[#181818] text-white font-semibold shadow-inner",
      inactiveTab: "text-zinc-500 hover:text-zinc-300",
      itemHover: "hover:bg-white/5",
      textPrimary: "text-white",
      textSecondary: "text-zinc-400",
      divider: "border-zinc-800/60",
      iconBg: "bg-[#252B1E] border border-[#3A452B] text-[#A8E038]",
    },
    glass: {
      card: "bg-[#212225]/85 backdrop-blur-xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] text-white",
      title: "text-white",
      link: "text-[#C5DC83] hover:text-[#b2cb6e]",
      tabsBg: "bg-white/5 border border-white/10",
      activeTab: "bg-white/15 text-white font-semibold border border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]",
      inactiveTab: "text-zinc-400 hover:text-zinc-200",
      itemHover: "hover:bg-white/5",
      textPrimary: "text-zinc-100",
      textSecondary: "text-zinc-400",
      divider: "border-white/5",
      iconBg: "bg-white/5 border border-white/10 text-zinc-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]",
    },
  }[variant];

  const renderIcon = (type: NotificationUIItem["type"]) => {
    switch (type) {
      case "rating":
        return <Star className="w-4 h-4" />;
      case "appointment":
        return <Clock className="w-4 h-4" />;
      case "status":
        return <Wrench className="w-4 h-4" />;
    }
  };

  return (
    <div className="relative inline-block" ref={containerRef}>
      <motion.button
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2.5 rounded-full transition-colors cursor-pointer ${
          variant === "light"
            ? "bg-zinc-100 hover:bg-zinc-200 text-zinc-800"
            : "bg-zinc-800 hover:bg-zinc-700 text-white"
        }`}
        aria-label="Notificaciones"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-1 w-2.5 h-2.5 bg-[#82C43C] rounded-full ring-2 ring-white" />
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`absolute right-0 mt-3 w-95 sm:w-105 rounded-[28px] p-6 z-50 ${styles.card}`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-bold ${styles.title}`}>
                Notificaciones
              </h3>
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

            <div className={`grid grid-cols-3 p-1 rounded-2xl mb-5 ${styles.tabsBg}`}>
              {(["Hoy", "Semana", "Ayer"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`py-1.5 text-xs rounded-xl transition-all duration-200 cursor-pointer ${
                    activeTab === tab ? styles.activeTab : styles.inactiveTab
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="space-y-3 max-h-95 overflow-y-auto pr-1">
              {loading && (
                <div className="py-8 flex flex-col items-center justify-center text-zinc-400">
                  <Loader2 className="w-6 h-6 animate-spin mb-2" />
                  <span className="text-xs">Cargando notificaciones...</span>
                </div>
              )}

              {!loading && filteredNotifications.length === 0 && (
                <div className="py-8 text-center text-zinc-400">
                  <p className="text-xs font-medium">No hay notificaciones en este periodo.</p>
                </div>
              )}

              {!loading &&
                filteredNotifications.map((item, index) => (
                  <div key={item.id}>
                    <div
                      onClick={() => item.isUnread && markAsRead(item.rawId)}
                      className={`flex gap-3.5 p-2 rounded-2xl transition-colors cursor-pointer ${styles.itemHover}`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${styles.iconBg}`}
                      >
                        {renderIcon(item.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            {item.isUnread && (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#82C43C] shrink-0" />
                            )}
                            <h4
                              className={`text-xs font-bold truncate ${styles.textPrimary}`}
                            >
                              {item.title}
                            </h4>
                          </div>
                          <span
                            className={`text-[11px] font-medium shrink-0 ${styles.textSecondary}`}
                          >
                            {item.time}
                          </span>
                        </div>
                        <p
                          className={`text-[11px] leading-relaxed line-clamp-2 ${styles.textSecondary}`}
                        >
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {index < filteredNotifications.length - 1 && (
                      <div className={`border-b my-1.5 ${styles.divider}`} />
                    )}
                  </div>
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}