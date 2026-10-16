import "@testing-library/jest-dom/vitest";
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import Centers from "@/features/admin/components/Centers";
import Users from "@/features/admin/components/Users";
import CenterForm from "@/features/admin/components/CenterForm";
import { adminApi } from "@/features/admin/api";

vi.mock("@/features/admin/api", () => ({ adminError: String, adminApi: {
  catalogs: vi.fn(async () => ({ provinces: [], municipalities: [], services: [], care_types: [] })),
  centers: vi.fn(async () => ({ items: [], total: 0, page: 1, pageSize: 20 })),
  users: vi.fn(async () => ({ items: [], total: 0, page: 1, pageSize: 20 })),
} }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });

it.each([ ["asilo", Centers, "centers"], ["usuario", Users, "users"] ] as const)(
  "filters %s automatically without a Buscar button",
  async (label, Component, method) => {
    render(<Component />);
    expect(screen.queryByRole("button", { name: "Buscar" })).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole("textbox", { name: `Buscar ${label}` }), { target: { value: "Ana" } });
    await waitFor(() => expect(adminApi[method]).toHaveBeenLastCalledWith(expect.objectContaining({ q: "Ana", page: 1 })));
    fireEvent.change(screen.getByRole("textbox", { name: `Buscar ${label}` }), { target: { value: "" } });
    await waitFor(() => expect(adminApi[method]).toHaveBeenLastCalledWith(expect.objectContaining({ q: "", page: 1 })));
  },
);

it("does not offer image URL entry in the system administrator form", async () => {
  render(<CenterForm initial={null} onSaved={vi.fn()} onCancel={vi.fn()} />);
  await screen.findByRole("button", { name: "Registrar asilo" });
  expect(screen.queryByRole("textbox", { name: /Imágenes opcionales/ })).not.toBeInTheDocument();
});
