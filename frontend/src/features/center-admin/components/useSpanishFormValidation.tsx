"use client";

import { useId, useState } from "react";

type Control = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

/** Retain HTML constraints without exposing browser-locale validation bubbles. */
function spanishError(field: Control): string {
  const { validity, value } = field;
  if (validity.valueMissing || (field.required && !value.trim())) return "Este campo es obligatorio.";
  if (validity.typeMismatch) return field instanceof HTMLInputElement && field.type === "email"
    ? "Escribe un correo electrónico válido."
    : "Escribe una dirección web válida (https://...).";
  if (validity.patternMismatch) return "Escribe 10 dígitos numéricos.";
  if (validity.badInput) return "Escribe un número válido.";
  if (validity.rangeUnderflow) return `El valor debe ser mayor o igual a ${(field as HTMLInputElement).min}.`;
  if (validity.rangeOverflow) return `El valor debe ser menor o igual a ${(field as HTMLInputElement).max}.`;
  if (validity.stepMismatch) return `Escribe un valor con incrementos de ${(field as HTMLInputElement).step || "1"}.`;
  // Browsers do not always set tooShort/tooLong for controlled/programmatic values.
  if ("minLength" in field && value && field.minLength > 0 && value.length < field.minLength) return `Escribe al menos ${field.minLength} caracteres.`;
  if ("maxLength" in field && field.maxLength >= 0 && value.length > field.maxLength) return `Escribe como máximo ${field.maxLength} caracteres.`;
  return validity.valid ? "" : "Revisa el valor de este campo.";
}

export function useSpanishFormValidation() {
  const prefix = useId();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const errorId = (name: string) => `${prefix}-${name}-error`;
  return {
    validate(form: HTMLFormElement) {
      const next: Record<string, string> = {};
      let first: Control | undefined;
      for (const element of Array.from(form.elements)) {
        if (!(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement) || !element.willValidate || !element.name) continue;
        const message = spanishError(element);
        if (message) {
          next[element.name] = message;
          first ??= element;
        }
      }
      setErrors(next);
      first?.focus();
      return !first;
    },
    fieldProps(name: string) {
      return { name, "aria-invalid": Boolean(errors[name]), "aria-describedby": errors[name] ? errorId(name) : undefined };
    },
    renderError(name: string) {
      return errors[name] ? <p id={errorId(name)} role="alert" className="mt-1 text-xs font-normal normal-case text-rose-700">{errors[name]}</p> : null;
    },
    clear: () => setErrors({}),
  };
}
