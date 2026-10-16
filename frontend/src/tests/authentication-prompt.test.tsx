import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import AuthenticationPrompt, { requestAuthentication } from "@/components/shared/AuthenticationPrompt";

afterEach(cleanup);

describe("protected visitor actions", () => {
  it("offers both authentication routes and returns to the visitor view when closed", () => {
    render(<><button>Catálogo</button><AuthenticationPrompt /></>);
    const origin = screen.getByRole("button", { name: "Catálogo" });
    origin.focus();
    act(() => requestAuthentication("Debes iniciar sesión para guardar residencias en tus favoritos."));
    expect(screen.getByRole("dialog")).toHaveTextContent("guardar residencias");
    expect(screen.getByRole("link", { name: "Iniciar sesión" })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("link", { name: "Registrarse" })).toHaveAttribute("href", "/register");
    fireEvent.click(screen.getByRole("button", { name: "Seguir explorando" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(origin).toHaveFocus();
  });
  it("supports Escape and keeps keyboard focus inside the dialog", () => {
    render(<AuthenticationPrompt />);
    act(() => requestAuthentication("Inicia sesión para consultar tus residencias guardadas."));
    const close = screen.getByRole("button", { name: "Cerrar aviso de inicio de sesión" });
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(screen.getByRole("button", { name: "Seguir explorando" })).toHaveFocus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(close).toHaveFocus();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
