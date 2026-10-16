import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import CatalogSubheader from "@/features/asylums/components/CatalogSubheader";
import HeaderDesign from "@/components/shared/HeaderDesign";

vi.mock("@/features/asylums/api/discovery", () => ({
  getAsylumCatalogs: vi.fn().mockResolvedValue({provinces: [], municipalities: [], services: [], care_types: []}),
}));
afterEach(cleanup);

it("keeps one rating-order control and only the grid view in the catalog toolbar", () => {
  render(<CatalogSubheader totalResults={11} savedCount={0} onOpenFavorites={vi.fn()} />);
  expect(screen.queryByRole("button", {name: "Mejor valoradas"})).not.toBeInTheDocument();
  expect(screen.queryByTitle("Vista en lista")).not.toBeInTheDocument();
  expect(screen.getByRole("button", {name: "Abiertas ahora"})).toBeVisible();
});

it("groups the existing certification checkbox under a named fieldset", async () => {
  render(<CatalogSubheader totalResults={11} savedCount={0} onOpenFavorites={vi.fn()} />);
  fireEvent.click(screen.getByRole("button", {name: "Filtros"}));
  const group = screen.getByRole("group", {name: "Certificaciones"});
  expect(within(group).getByRole("checkbox", {name: "Solo centros con certificaciones declaradas"})).toBeVisible();
});

it("can hide the decorative residence label in the catalog banner only", () => {
  render(<HeaderDesign title="Catálogo" showResidenceLabel={false} />);
  expect(screen.queryByText("Información de residencias")).not.toBeInTheDocument();
});
