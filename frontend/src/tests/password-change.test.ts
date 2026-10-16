import {describe, expect, it} from "vitest";
import {passwordChangeErrors} from "@/lib/validations/password-change";

describe("password change acceptance rules", () => {
  it("separates each required field in Spanish", () => {
    const errors=passwordChangeErrors("", "", "");
    expect(errors.current).toContain("actual o temporal");
    expect(errors.next).toBe("Escribe tu nueva contraseña.");
    expect(errors.confirmation).toBe("Confirma tu nueva contraseña.");
  });
  it("reserves the equality error for a password equal to the current one", () => {
    expect(passwordChangeErrors("ClaveActual1!", "ClaveActual1!", "ClaveActual1!").next).toContain("igual");
    expect(passwordChangeErrors("Actual1!", "abcdefgh", "abcdefgh").next).not.toContain("igual");
  });
  it.each([
    ["Ab1!", "entre 8 y 128"], ["A".repeat(129)+"a1!", "entre 8 y 128"],
    ["abcdefg1!", "mayúscula"], ["ABCDEFG1!", "minúscula"],
    ["Abcdefgh!", "número"], ["Abcdefgh1", "símbolo"],
  ])("identifies the specific missing rule for %s", (next, rule) => {
    expect(passwordChangeErrors("Actual1!", next, next).next).toContain(rule);
  });
  it("keeps confirmation errors separate from complexity errors", () => {
    const errors=passwordChangeErrors("Actual1!", "NuevaValida2!", "OtraValida3!");
    expect(errors.next).toBeUndefined();
    expect(errors.confirmation).toBe("Las contraseñas no coinciden.");
  });
  it("accepts a complete, distinct matching password", () => {
    expect(passwordChangeErrors("Anterior1!", "NuevaValida2!", "NuevaValida2!")).toEqual({});
  });
});
