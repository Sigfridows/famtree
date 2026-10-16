"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LogIn, X } from "lucide-react";

export function requestAuthentication(message: string) {
  window.dispatchEvent(new CustomEvent("famtree:authentication-required", { detail: message }));
}

/** One application dialog for protected actions; closing leaves the visitor's view intact. */
export default function AuthenticationPrompt() {
  const [message, setMessage] = useState("");
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const show = (event: Event) => setMessage((event as CustomEvent<string>).detail);
    window.addEventListener("famtree:authentication-required", show);
    return () => window.removeEventListener("famtree:authentication-required", show);
  }, []);
  useEffect(() => {
    if (!message) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.querySelector<HTMLElement>("button, a")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMessage("");
      if (event.key !== "Tab") return;
      const controls = Array.from(panel.current?.querySelectorAll<HTMLElement>("button, a") ?? []);
      const first = controls[0], last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [message]);
  if (!message) return null;
  return <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm" onClick={event => { if (event.target === event.currentTarget) setMessage(""); }}>
    <div ref={panel} role="dialog" aria-modal="true" aria-labelledby="authentication-title" aria-describedby="authentication-message" className="relative w-full max-w-md rounded-3xl border border-white/15 bg-zinc-900 p-7 text-white shadow-2xl">
      <button type="button" aria-label="Cerrar aviso de inicio de sesión" onClick={() => setMessage("")} className="absolute right-4 top-4 rounded-full p-2 hover:bg-white/10"><X size={18} /></button>
      <LogIn className="mb-4 text-[#CCDD99]" size={28} />
      <h2 id="authentication-title" className="text-xl font-bold">Inicia sesión para continuar</h2>
      <p id="authentication-message" className="my-4 text-sm text-zinc-300">{message}</p>
      <div className="flex flex-wrap gap-3">
        <Link href="/login" onClick={() => setMessage("")} className="rounded-xl bg-[#CCDD99] px-4 py-3 font-bold text-zinc-950">Iniciar sesión</Link>
        <Link href="/register" onClick={() => setMessage("")} className="rounded-xl border border-white/25 px-4 py-3 font-bold">Registrarse</Link>
      </div>
      <button type="button" onClick={() => setMessage("")} className="mt-5 text-sm text-zinc-300 underline">Seguir explorando</button>
    </div>
  </div>;
}
