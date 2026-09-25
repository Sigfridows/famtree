"use client";

import { Star, Clock, Wrench } from "lucide-react";
import type { NotificationUIItem } from "../types/notification.types";

interface NotificationItemProps {
  item: NotificationUIItem;
  styles: Record<string, string>;
  onRead: (id: number) => void;
}

export default function NotificationItem({ item, styles, onRead }: NotificationItemProps) {
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
    <div
      onClick={() => item.isUnread && onRead(item.rawId)}
      className={`flex gap-3.5 p-2 rounded-2xl transition-colors cursor-pointer ${styles.itemHover}`}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${styles.iconBg}`}>
        {renderIcon(item.type)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-1.5 min-w-0">
            {item.isUnread && <span className="w-1.5 h-1.5 rounded-full bg-[#82C43C] shrink-0" />}
            <h4 className={`text-xs font-bold truncate ${styles.textPrimary}`}>{item.title}</h4>
          </div>
          <span className={`text-[11px] font-medium shrink-0 ${styles.textSecondary}`}>{item.time}</span>
        </div>
        <p className={`text-[11px] leading-relaxed line-clamp-2 ${styles.textSecondary}`}>{item.description}</p>
      </div>
    </div>
  );
}