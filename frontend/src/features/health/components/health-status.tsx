"use client";

import { useEffect, useState } from "react";

import { getHealth } from "../api/get-health";

type Status = "checking" | "online" | "offline";

export function HealthStatus() {
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    let active = true;
    getHealth()
      .then(() => active && setStatus("online"))
      .catch(() => active && setStatus("offline"));
    return () => {
      active = false;
    };
  }, []);

  const content = {
    checking: ["Comprobando API", "bg-amber-300"],
    online: ["API conectada", "bg-emerald-300"],
    offline: ["API no disponible", "bg-rose-300"],
  } as const;

  return (
    <div
      aria-live="polite"
      className="flex w-fit items-center gap-3 rounded-xl border border-emerald-800 bg-emerald-900/60 px-5 py-4"
    >
      <span className={`h-2.5 w-2.5 rounded-full ${content[status][1]}`} aria-hidden="true" />
      <span className="font-medium">{content[status][0]}</span>
    </div>
  );
}
