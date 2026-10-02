export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: "El nombre de usuario o la contraseña son incorrectos.",
};

export const validatePassword = (password: string): ValidationResult => {
  if (Array.from(password).length < 8 || Array.from(password).length > 128 ||
      !/\p{Ll}/u.test(password) || !/\p{Lu}/u.test(password) ||
      !/\p{Nd}/u.test(password) || !/[^\p{L}\p{N}\s]/u.test(password)) {
    return {
      isValid: false,
      message: "La contraseña debe tener entre 8 y 128 caracteres, mayúscula, minúscula, número y símbolo.",
    };
  }
  return { isValid: true };
};

export const validatePasswordsMatch = (
  pass: string,
  confirmPass: string
): ValidationResult => {
  if (!confirmPass) return { isValid: false, message: "Confirma tu contraseña." };
  if (pass !== confirmPass) {
    return { isValid: false, message: "Las contraseñas no coinciden" };
  }
  return { isValid: true };
};
export const REGISTER_RULES: Record<string, string> = {
  username: "El usuario debe tener entre 3 y 16 caracteres, solo letras sin acentos y números (sin espacios ni puntos).",
  firstName: "El nombre debe tener entre 2 y 50 caracteres, solo letras y espacios.",
  lastName: "El apellido debe tener entre 2 y 50 caracteres, solo letras y espacios.",
  email: "Introduce un correo válido de hasta 100 caracteres.",
  password: "La contraseña debe tener entre 8 y 128 caracteres, mayúscula, minúscula, número y símbolo.",
  confirmPassword: "Confirma tu contraseña y comprueba que ambas coincidan.",
};

export function registrationErrorMessage(details: unknown): string {
  if (Array.isArray(details)) {
    const messages = details.flatMap((detail) => {
      const field = Array.isArray(detail?.loc) ? detail.loc.at(-1) : undefined;
      const aliases: Record<string, string> = {first_name: "firstName", last_name: "lastName", confirm_password: "confirmPassword"};
      const message = typeof field === "string" ? REGISTER_RULES[aliases[field] ?? field] : undefined;
      return message ? [message] : [];
    });
    if (messages.length) return [...new Set(messages)].join(" ");
  }
  return "Revisa el usuario, nombre, apellido, correo y las contraseñas. Los datos no cumplen los requisitos del registro.";
}
