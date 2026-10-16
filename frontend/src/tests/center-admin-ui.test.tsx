import "@testing-library/jest-dom/vitest";
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import ForcePasswordChangeModal from "@/features/center-admin/components/ForcePasswordChangeModal";
import CenterEditor from "@/features/center-admin/components/CenterEditor";
import CenterReviews from "@/features/center-admin/components/CenterReviews";
import AdminSettingsPage from "@/app/(center-admin)/center-admin/settings/page";
import { centerAdminService } from "@/features/center-admin/api/centerAdminService";
import { PasswordModal } from "@/features/profile/components/PasswordModal";

vi.mock("next/image", () => ({default: () => null}));
vi.mock("@/features/center-admin/components/CenterGallery", () => ({default: () => null}));
vi.mock("@/features/center-admin/api/centerAdminService", () => ({centerAdminService: {
  getMyCenterInfo: vi.fn(async () => ({name: "Centro", address: "Calle", status: "ACTIVE", phone: "8095551234", email: "centro@example.com", minPrice: "100", maxPrice: "200", totalCapacity: 40, website: "", description: "Descripción suficientemente larga del centro", entryRequirements: "Documento de identidad", certifications: "", serviceIds: [1], seniorTypeIds: [1]})),
  updateCenterInfo: vi.fn(),
  getReviews: vi.fn(async () => ({summary: {average: 0, count: 0, distribution: {}}, items: [], total: 0, pageSize: 10})),
}}));
vi.mock("@/lib/apiClient", async (original) => ({...await original<typeof import("@/lib/apiClient")>(), apiClient: {get: vi.fn(async () => ({data: {services: [], care_types: []}}))}}));
vi.mock("@/features/profile/hooks/useProfile", () => ({useProfile: () => ({profile: {userId: 1, firstName: "Ana", lastName: "Pérez", username: "ana", email: "ana@example.com"}, loading: false, saving: false, updateProfile: vi.fn()})}));
vi.mock("@/features/auth/hooks/useAuth", () => ({useAuth: () => ({refreshSession: vi.fn()})}));
afterEach(cleanup);
it("removes center-admin photo editing", () => {
  render(<AdminSettingsPage />);
  expect(screen.queryByText("Cambiar foto")).not.toBeInTheDocument();
  expect(document.querySelector('input[type="file"]')).toBeNull();
});
it("provides a usable search with automatic filtering and no Filtrar button", async () => {
  render(<CenterReviews />);
  expect(screen.queryByRole("button", {name: "Filtrar"})).not.toBeInTheDocument();
  expect(screen.getByLabelText("Buscar reseñas").parentElement).toHaveClass("min-w-0");
  fireEvent.change(screen.getByLabelText("Buscar reseñas"), {target: {value: "Ana"}});
  await waitFor(() => expect(centerAdminService.getReviews).toHaveBeenLastCalledWith(1, "Ana", undefined, "newest"));
});
it("replaces native email and price validation with accessible Spanish app errors", async () => {
  render(<CenterEditor />);
  const email = await screen.findByLabelText("Correo");
  const form = email.closest("form")!;
  expect(form).toHaveAttribute("novalidate");
  fireEvent.change(email, {target: {value: ""}});
  fireEvent.submit(form);
  expect(email).toHaveAttribute("aria-invalid", "true");
  expect(email).toHaveAccessibleDescription(/obligatorio/i);
  expect(email).toHaveFocus();
  expect(centerAdminService.updateCenterInfo).not.toHaveBeenCalled();
  fireEvent.change(email, {target: {value: "sa"}});
  fireEvent.submit(form);
  expect(email).toHaveAccessibleDescription(/correo electrónico válido/i);
  fireEvent.change(email, {target: {value: "centro@example.com"}});
  const max = screen.getByLabelText("Precio máximo (RD$)");
  fireEvent.change(max, {target: {value: "99"}});
  fireEvent.submit(form);
  expect(max).toHaveAccessibleDescription(/mayor o igual a 100/i);
  fireEvent.change(max, {target: {value: "200"}});
  fireEvent.submit(form);
  await waitFor(() => expect(centerAdminService.updateCenterInfo).toHaveBeenCalledOnce());
});
it.each([
  ["Teléfono", "123", /10 dígitos/],
  ["Precio mínimo (RD$)", "0", /mayor o igual a 0.01/],
  ["Precio mínimo (RD$)", "100.001", /incrementos de 0.01/],
  ["Capacidad total", "0", /mayor o igual a 1/],
  ["Capacidad total", "100001", /menor o igual a 100000/],
  ["Capacidad total", "1.5", /incrementos de 1/],
  ["Sitio web", "incorrecto", /dirección web válida/],
  ["Descripción", "Corta", /al menos 20 caracteres/],
  ["Descripción", "a".repeat(1001), /como máximo 1000/],
  ["Requisitos de ingreso", "Corto", /al menos 10 caracteres/],
  ["Requisitos de ingreso", "a".repeat(501), /como máximo 500/],
  ["Certificaciones", "a".repeat(251), /como máximo 250/],
])("preserves the %s constraint with Spanish inline feedback", async (label, value, message) => {
  render(<CenterEditor />);
  const field = await screen.findByLabelText(label);
  fireEvent.change(field, {target: {value}});
  fireEvent.submit(field.closest("form")!);
  expect(field).toHaveAttribute("aria-invalid", "true");
  expect(field).toHaveAccessibleDescription(message);
  expect(field).toHaveFocus();
});
it("validates account names and phone in Spanish without native bubbles", () => {
  render(<AdminSettingsPage />);
  const first = screen.getByRole("textbox", {name: "Nombre"});
  const form = first.closest("form")!;
  expect(form).toHaveAttribute("novalidate");
  fireEvent.change(first, {target: {value: "A"}});
  fireEvent.submit(form);
  expect(first).toHaveAccessibleDescription(/al menos 2 caracteres/);
  fireEvent.change(first, {target: {value: "Ana"}});
  const phone = screen.getByRole("textbox", {name: "Teléfono"});
  fireEvent.change(phone, {target: {value: "abc"}});
  fireEvent.submit(form);
  expect(phone).toHaveAccessibleDescription(/10 dígitos/);
});
it("keeps password errors outside the eye positioning container", () => {
  render(<ForcePasswordChangeModal isOpen onPasswordChanged={vi.fn()} onExit={vi.fn()} />);
  fireEvent.click(screen.getByRole("button", {name: "Actualizar y Acceder al Panel"}));
  const field = screen.getByLabelText("Nueva contraseña");
  expect(field.parentElement?.querySelector("p")).toBeNull();
  expect(screen.getByRole("button", {name: "Mostrar nueva contraseña"})).toBeInTheDocument();
});
it("uses an explicit readable foreground on light password inputs", () => {
  render(<PasswordModal isOpen onClose={vi.fn()} onSuccess={vi.fn()} />);
  expect(screen.getByLabelText("Nueva contraseña")).toHaveClass("text-slate-900");
});
