"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./useAuth";
import { AUTH_ERRORS } from "@/lib/validations/auth";
import { ApiError, friendlyError } from "@/lib/apiClient";

export function useLoginForm() {
  const { login } = useAuth();
  const router = useRouter();

  const [submitted, setSubmitted] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setErrorMessage(null);

    if (!username.trim() || !password) {
      setErrorMessage("Completa los campos obligatorios.");
      const form = e.currentTarget as HTMLFormElement;
      form.querySelector<HTMLInputElement>(!username.trim() ? "#login-username" : "#login-password")?.focus();
      return;
    }

    setIsLoading(true);

    try {
      const user = await login({ username: username.trim(), password });
      router.push(
        user.role === "SYSTEM_ADMIN"
          ? "/system-admin"
          : user.role === "ASYLUM_ADMIN"
            ? "/center-admin/asylum"
            : (() => { const callback = new URLSearchParams(window.location.search).get("callbackUrl"); return callback && /^\/(catalog|review|map|profile)(\?|$)/.test(callback) ? callback : "/catalog"; })(),
      );
    } catch (err: unknown) {
      setPassword("");
      if (err instanceof ApiError && err.message) {
        setErrorMessage(err.status === 429 ? "Demasiados intentos. El bloqueo dura hasta 15 minutos desde el último intento permitido. Espera antes de volver a intentar." : err.status === 401 ? AUTH_ERRORS.INVALID_CREDENTIALS : friendlyError(err, AUTH_ERRORS.INVALID_CREDENTIALS));
      } else {
        setErrorMessage(AUTH_ERRORS.INVALID_CREDENTIALS);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formState: {
      username,
      usernameError: submitted && !username.trim() ? "Escribe tu nombre de usuario." : null,
      passwordRequiredError: submitted && !password ? "Escribe tu contraseña." : null,
      password,
      showPassword,
      errorMessage,
      isLoading,
    },
    handlers: {
      setUsername,
      setPassword,
      togglePasswordVisibility,
      handleSubmit,
    },
  };
}
