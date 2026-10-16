import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import MapContainer from "@/features/map/components/MapContainer";

vi.mock("@/features/asylums/hooks/useFavorites", () => ({useFavorites: () => ({favorites: [], isFavorite: () => false, toggleFavorite: vi.fn()})}));
vi.mock("@/features/asylums/hooks/useAsylumDetail", () => ({useAsylumDetail: () => ({data: null})}));
vi.mock("@/features/asylums/components/AsiloDetails", () => ({default: () => null}));
vi.mock("@/components/shared/HeaderControls", () => ({default: () => null}));
vi.mock("@/features/map/hooks/useAsylumMap", () => ({useAsylumMap: () => ({
  pins: [{id: 1, name: "Centro Primero", rating: null, review_count: 0, price_min: "100", price_max: "200"},
    {id: 2, name: "Centro Último", rating: 5, review_count: 2, price_min: "200", price_max: "300"}],
  loading: false, updateFilters: vi.fn(),
})}));
vi.mock("@/features/map/components/MapLeafletView", () => ({default: ({onPinSelect}: {onPinSelect: (id: number) => void}) =>
  <button onClick={() => onPinSelect(2)}>Marcador de Centro Último</button>}));

afterEach(cleanup);

it("moves the selected marker's card first, highlights it, and resets the sidebar scroll", async () => {
  render(<MapContainer />);
  const list = screen.getByRole("list", {name: "Residencias en el mapa"});
  list.scrollTop = 250;
  fireEvent.click(screen.getByRole("button", {name: "Marcador de Centro Último"}));
  const cards = within(list).getAllByRole("listitem");
  expect(cards[0]).toHaveTextContent("Centro Último");
  expect(cards[0]).toHaveAttribute("aria-current", "true");
  await waitFor(() => expect(within(cards[0]).getByText("Seleccionado")).toBeVisible());
  expect(list.scrollTop).toBe(0);
  expect(within(list).queryByText("5.0")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", {name: "Cerrar selección"}));
  expect(within(list).getAllByRole("listitem")[0]).toHaveTextContent("Centro Primero");
  expect(within(list).queryByText("Seleccionado")).not.toBeInTheDocument();
});
