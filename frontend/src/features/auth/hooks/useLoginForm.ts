"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./useAuth";
import { AUTH_ERRORS } from "@/lib/validations/auth";
import { ApiError } from "@/lib/apiClient";

export function useLoginForm() {
  const { login } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim() || !password) {
      setErrorMessage(AUTH_ERRORS.INVALID_CREDENTIALS);
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
            : "/catalog",
      );
    } catch (err: unknown) {
      setPassword("");
      if (err instanceof ApiError && err.message) {
        setErrorMessage(err.message);
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
