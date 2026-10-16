import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import { getAsylums } from "@/features/asylums/api/discovery";

vi.mock("@/features/asylums/api/discovery", () => ({getAsylums: vi.fn().mockResolvedValue({items: [{id: 99, name: "Centro no guardado", review_count: 0}], pagination: {pages: 1}})}));
afterEach(() => {cleanup(); vi.clearAllMocks();});
import Compare from "@/features/asylums/components/Compare";
import { compareAsylums } from "@/features/compare/api/compare-asylums";
import type { AsylumDetail } from "@/features/asylums/types/asylum.types";

vi.mock("@/features/asylums/components/EmptyState", () => ({ default: () => null }));
vi.mock("@/features/compare/api/compare-asylums", () => ({ compareAsylums: vi.fn() }));
const items: AsylumDetail[] = [1, 2].map(id => ({
  id, name: `Centro ${id}`, province_id: 1, province_name: "Azua", municipality_id: 1,
  municipality_name: "Azua", sector: "Centro", address: "Calle 1", latitude: 18,
  longitude: -69, price_min: "20000", price_max: "30000", cover_url: null,
  rating: 4, review_count: 1, description: "Centro de prueba", admission_requirements: "Evaluación",
  capacity: 20, certifications: null, phone: "8095550100", email: "test@example.invalid",
  website: null, images: [], services: [{id, name: `Servicio real ${id}`}], care_types: [],
}));

describe("comparison", () => {
  it("only offers saved active residences and never loads the public catalog", async () => {
    render(<Compare items={[...items, {...items[0], id: 3, name: "Centro cerrado", status: "INACTIVE"}]} />);
    await waitFor(() => expect(screen.getByRole("checkbox", {name: "Seleccionar Centro 1"})).toBeVisible());
    expect(getAsylums).not.toHaveBeenCalled();
    expect(screen.queryByText("Centro no guardado")).not.toBeInTheDocument();
    expect(screen.queryByText("Centro cerrado")).not.toBeInTheDocument();
    expect(screen.getAllByRole("checkbox")).toHaveLength(2);
  });

  it("asks users with fewer than two favorites to save another residence", () => {
    render(<Compare items={items.slice(0, 1)} />);
    expect(screen.getByRole("status")).toHaveTextContent(/favoritos/i);
    expect(screen.getByRole("button", {name: "Comparar (0/4)"})).toBeDisabled();
  });
  it("selects a checkbox once and displays actual API services for selected centers", async () => {
    vi.mocked(compareAsylums).mockResolvedValue({items});
    render(<Compare items={items} />);
    const button = screen.getByRole("button", {name: "Comparar (0/4)"});
    expect(button).toBeDisabled();
    fireEvent.click(screen.getByRole("checkbox", {name: "Seleccionar Centro 1"}));
    expect(screen.getByRole("checkbox", {name: "Seleccionar Centro 1"})).toBeChecked();
    expect(screen.getByRole("button", {name: "Comparar (1/4)"})).toBeDisabled();
    fireEvent.click(screen.getByRole("checkbox", {name: "Seleccionar Centro 2"}));
    fireEvent.click(screen.getByRole("button", {name: "Comparar (2/4)"}));
    await waitFor(() => expect(compareAsylums).toHaveBeenCalledWith([1, 2]));
    await waitFor(() => expect(screen.getByText("Servicio real 1")).toBeVisible());
    await waitFor(() => expect(screen.getByText("Servicio real 2")).toBeVisible());
    expect(screen.queryByText("Cámaras y Seguridad")).not.toBeInTheDocument();
  });
});
