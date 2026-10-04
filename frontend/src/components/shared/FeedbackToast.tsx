"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, X, XCircle } from "lucide-react";

export type FeedbackTone = "success" | "error" | "info";
export type FeedbackEvent = { message: string; tone?: FeedbackTone };

export function emitFeedback(event: FeedbackEvent) {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("famtree:feedback", { detail: event }));
}

export default function FeedbackToast() {
  const [event, setEvent] = useState<FeedbackEvent | null>(null);
  useEffect(() => {
    const onFeedback = (value: Event) => setEvent((value as CustomEvent<FeedbackEvent>).detail);
    window.addEventListener("famtree:feedback", onFeedback);
    return () => window.removeEventListener("famtree:feedback", onFeedback);
  }, []);
  useEffect(() => {
    if (!event) return;
    const timer = window.setTimeout(() => setEvent(null), 4500);
    return () => window.clearTimeout(timer);
  }, [event]);
  if (!event) return null;
  const error = event.tone === "error";
  return <div role={error ? "alert" : "status"} aria-live="polite" className={`fixed right-4 top-4 z-[100] flex max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 text-sm shadow-2xl backdrop-blur-xl ${error ? "border-rose-400/40 bg-rose-950/90 text-rose-100" : "border-emerald-400/40 bg-emerald-950/90 text-emerald-100"}`}>
    {error ? <XCircle className="mt-0.5 h-4 w-4 shrink-0" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />}
    <span className="flex-1">{event.message}</span>
    <button type="button" aria-label="Cerrar mensaje" onClick={() => setEvent(null)}><X className="h-4 w-4" /></button>
  </div>;
}
