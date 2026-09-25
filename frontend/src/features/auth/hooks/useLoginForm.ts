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
      await login({ email: username.trim(), password });
      router.push("/catalog");
    } catch (err: unknown) {
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