import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import CatalogPage from "@/app/(main)/catalog/page";
import type { AsylumSummary } from "@/features/asylums/types/asylum.types";

const state = vi.hoisted(() => ({ items: [] as AsylumSummary[], updateFilters: vi.fn(), filters: {} }));
vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams() }));
vi.mock("@/features/auth/hooks/useAuth", () => ({ useAuth: () => ({isAuthenticated: true}) }));
vi.mock("@/features/asylums/hooks/useAsylums", () => ({useAsylums: () => ({data: {items: state.items, pagination: {pages: 1}}, filters: state.filters, loading: false, updateFilters: state.updateFilters})}));
vi.mock("@/features/asylums/hooks/useAsylumDetail", () => ({useAsylumDetail: () => ({data: null})}));
vi.mock("@/features/asylums/hooks/useFavorites", () => ({useFavorites: () => ({favorites: [], isFavorite: () => false, toggleFavorite: vi.fn(), removeFavoriteById: vi.fn()})}));
vi.mock("@/features/asylums/components/AsiloDetails", () => ({default: () => null}));
vi.mock("@/components/shared/HeaderControls", () => ({default: () => null}));
vi.mock("@/features/asylums/api/discovery", () => ({getAsylumCatalogs: vi.fn().mockResolvedValue({provinces: [], municipalities: [], services: [], care_types: []})}));
afterEach(() => {cleanup(); vi.clearAllMocks(); state.filters = {};});

it("keeps public API centers without a status field when clicking Abiertas ahora, matching the card badge", () => {
  state.items = [{id: 1, name: "Centro público", price_min: "100", price_max: "200", review_count: 0} as AsylumSummary];
  render(<CatalogPage />);
  expect(screen.getByText("Abierto")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", {name: "Abiertas ahora"}));
  expect(screen.getByText("Centro público")).toBeInTheDocument();
  expect(screen.queryByText("No se encontraron residencias")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", {name: "Todas"}));
  expect(screen.getByText("Centro público")).toBeInTheDocument();
});

it("excludes explicit inactive centers while retaining active centers", () => {
  state.items = [{id: 1, name: "Activo", status: "ACTIVE"}, {id: 2, name: "Inactivo", status: "INACTIVE"}] as AsylumSummary[];
  render(<CatalogPage />);
  fireEvent.click(screen.getByRole("button", {name: "Abiertas ahora"}));
  expect(screen.getByText("Activo")).toBeInTheDocument();
  expect(screen.queryByText("Inactivo")).not.toBeInTheDocument();
});
