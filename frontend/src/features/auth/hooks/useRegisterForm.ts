"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./useAuth";
import { validatePassword, validatePasswordsMatch } from "@/lib/validations/auth";
import { ApiError } from "@/lib/apiClient";

export function useRegisterForm() {
  const { register } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const passwordValidation = passwordTouched
    ? validatePassword(password)
    : { isValid: true, message: "" };

  const confirmPasswordValidation = validatePasswordsMatch(
    password,
    confirmPassword
  );

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword((prev) => !prev);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim() || !firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      setErrorMessage("Por favor, complete todos los campos requeridos.");
      return;
    }

    if (!passwordValidation.isValid) {
      setErrorMessage(passwordValidation.message || "La contraseña no cumple con el formato requerido.");
      return;
    }

    if (!confirmPasswordValidation.isValid) {
      setErrorMessage(confirmPasswordValidation.message || "Las contraseñas no coinciden.");
      return;
    }

    setIsLoading(true);

    try {
      await register({
        username: username.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        password,
      });
      router.push("/catalog");
    } catch (err: unknown) {
      if (err instanceof ApiError && err.message) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Error al registrar la cuenta. Verifique los datos ingresados.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formState: {
      username,
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      showPassword,
      showConfirmPassword,
      passwordError: passwordValidation.message,
      isPasswordInvalid: !passwordValidation.isValid,
      confirmPasswordError: confirmPasswordValidation.message,
      isLoading,
      errorMessage,
    },
    handlers: {
      setUsername,
      setFirstName,
      setLastName,
      setEmail,
      setPassword,
      setConfirmPassword,
      setPasswordTouched: () => setPasswordTouched(true),
      togglePasswordVisibility,
      toggleConfirmPasswordVisibility,
      handleSubmit,
    },
  };
}