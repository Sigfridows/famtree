"use client";

import { Star, Clock, Wrench } from "lucide-react";
import type { NotificationUIItem } from "../types/notification.types";

interface NotificationItemProps {
  item: NotificationUIItem;
  styles: {
    itemHover: string;
    textPrimary: string;
    textSecondary: string;
    iconBg: string;
  };
  onRead: (id: number) => void;
}

export default function NotificationItem({ item, styles, onRead }: NotificationItemProps) {
  const renderIcon = (type: NotificationUIItem["type"]) => {
    switch (type) {
      case "rating":
        return <Star className="w-4 h-4 text-amber-400" />;
      case "appointment":
        return <Clock className="w-4 h-4 text-sky-400" />;
      case "status":
        return <Wrench className="w-4 h-4 text-[#CCDD99]" />;
      default:
        return <Clock className="w-4 h-4 text-zinc-400" />;
    }
  };

  return (
    <div
      onClick={() => item.isUnread && onRead(item.rawId)}
      className={`group flex items-start gap-3.5 p-2.5 rounded-xl transition-all cursor-pointer border border-transparent ${
        item.isUnread ? "bg-white/3 border-white/5" : ""
      } ${styles.itemHover}`}
    >
      {/* Contenedor del Icono */}
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${styles.iconBg}`}>
        {renderIcon(item.type)}
      </div>

      {/* Contenido */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <div className="flex items-center gap-1.5 min-w-0">
            {item.isUnread && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#CCDD99] shadow-[0_0_8px_#CCDD99] shrink-0" />
            )}
            <h4 className={`text-xs font-semibold truncate tracking-tight ${styles.textPrimary}`}>
              {item.title}
            </h4>
          </div>
          <span className={`text-[10px] font-medium shrink-0 ${styles.textSecondary}`}>
            {item.time}
          </span>
        </div>
        <p className={`text-[11px] leading-relaxed line-clamp-2 ${styles.textSecondary}`}>
          {item.description}
        </p>
      </div>
    </div>
  );
}