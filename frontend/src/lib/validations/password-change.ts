export function passwordChangeErrors(current: string, next: string, confirmation: string) {
  const errors: Record<string, string> = {};
  if (!current) errors.current = 'Escribe tu contraseña actual o temporal.';
  const missing = [
    next.length < 8 || next.length > 128 ? 'entre 8 y 128 caracteres' : '',
    !/[A-Z]/.test(next) ? 'una mayúscula' : '', !/[a-z]/.test(next) ? 'una minúscula' : '',
    !/[0-9]/.test(next) ? 'un número' : '', !/[^A-Za-z0-9\s]/.test(next) ? 'un símbolo' : '',
  ].filter(Boolean);
  if (!next) errors.next = 'Escribe tu nueva contraseña.';
  else if (current === next) errors.next = 'La nueva contraseña no puede ser igual a la contraseña actual.';
  else if (missing.length) errors.next = `La nueva contraseña necesita ${missing.join(', ')}.`;
  if (!confirmation) errors.confirmation = 'Confirma tu nueva contraseña.';
  else if (next !== confirmation) errors.confirmation = 'Las contraseñas no coinciden.';
  return errors;
}
