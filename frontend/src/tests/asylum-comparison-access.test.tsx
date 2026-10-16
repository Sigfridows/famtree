import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import AsiloDetails, { type AsiloDetailData } from "@/features/asylums/components/AsiloDetails";
import AuthenticationPrompt from "@/components/shared/AuthenticationPrompt";
import type { AsylumSummary } from "@/features/asylums/types/asylum.types";

const state = vi.hoisted(() => ({authenticated: false, push: vi.fn()}));
vi.mock("next/navigation", () => ({useRouter: () => ({push: state.push}), usePathname: () => "/catalog", useSearchParams: () => new URLSearchParams()}));
vi.mock("@/features/auth/hooks/useAuth", () => ({useAuth: () => ({isAuthenticated: state.authenticated})}));
vi.mock("@/features/asylums/components/LocationMap", () => ({default: () => null}));
vi.mock("@/features/asylums/components/Compare", () => ({default: ({items, ...props}: {items: AsylumSummary[]; data?: unknown}) => <div role="dialog" aria-label="Comparación de favoritos">{items.map(item => <span key={item.id}>{item.name}</span>)}{props.data ? <span>Detalle no guardado añadido</span> : null}</div>}));
const detail: AsiloDetailData = {id: "99", title: "Centro no guardado", address: "Calle 1", schedule: "Siempre", email: "test@example.invalid", phone: "8095550100", admin: "Ana", priceMin: 100, description: "Centro de prueba", rating: null, images: []};
afterEach(cleanup);
beforeEach(() => {state.authenticated = false; vi.clearAllMocks();});

it("opens the sign-in modal for a visitor comparison without navigating or loading comparison", async () => {
  render(<><AsiloDetails isOpen onClose={vi.fn()} data={detail} /><AuthenticationPrompt /></>);
  fireEvent.click(screen.getByRole("button", {name: "Comparar"}));
  await waitFor(() => expect(screen.getByRole("dialog")).toHaveTextContent(/inicia sesión.*comparar/i));
  expect(screen.queryByRole("dialog", {name: "Comparación de favoritos"})).not.toBeInTheDocument();
  expect(screen.getByRole("link", {name: "Iniciar sesión"})).toBeVisible();
  expect(state.push).not.toHaveBeenCalled();
});

it("passes favorites only, never the unsaved current detail, for an authenticated comparison", async () => {
  state.authenticated = true;
  const favorite = {id: 1, name: "Centro favorito"} as AsylumSummary;
  render(<AsiloDetails isOpen onClose={vi.fn()} data={detail} favorites={[favorite]} />);
  fireEvent.click(screen.getByRole("button", {name: "Comparar"}));
  const comparison = await screen.findByRole("dialog", {name: "Comparación de favoritos"});
  expect(comparison).toHaveTextContent("Centro favorito");
  expect(comparison).not.toHaveTextContent("Detalle no guardado añadido");
});
