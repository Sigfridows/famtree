export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: "El nombre de usuario o la contraseña son incorrectos.",
};

export const validatePassword = (password: string): ValidationResult => {
  if (!password) return { isValid: true };
  if (password.length < 8) {
    return {
      isValid: false,
      message: "Debe ser una contraseña con 8 caracteres",
    };
  }
  return { isValid: true };
};

export const validatePasswordsMatch = (
  pass: string,
  confirmPass: string
): ValidationResult => {
  if (!confirmPass) return { isValid: true };
  if (pass !== confirmPass) {
    return { isValid: false, message: "Las contraseñas no coinciden" };
  }
  return { isValid: true };
};