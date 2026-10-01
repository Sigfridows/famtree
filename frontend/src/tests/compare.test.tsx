import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
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
