import "@testing-library/jest-dom/vitest";
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import RegisterPage from "@/app/(auth)/register/page";
import { PasswordModal } from "@/features/profile/components/PasswordModal";
import ForcePasswordChangeModal from "@/features/center-admin/components/ForcePasswordChangeModal";
import { CustomSelect } from "@/features/profile/components/CustomSelect";

vi.mock("next/navigation", () => ({useRouter: () => ({push: vi.fn()})}));
vi.mock("@/features/auth/hooks/useAuth", () => ({useAuth: () => ({register: vi.fn()})}));
vi.mock("next/image", () => ({default: () => null}));
afterEach(cleanup);
it("uses application Spanish registration errors rather than native email bubbles", async () => {
  render(<RegisterPage />);
  const email = screen.getByLabelText("Correo Electrónico *");
  expect(email.closest("form")).toHaveAttribute("novalidate");
  for (const [label, value] of [["Nombre Usuario *", "Ana123"], ["Nombre Completo *", "Ana"], ["Apellido Completo *", "Pérez"], ["Correo Electrónico *", "incorrecto"], ["Contraseña *", "ValidTest9!"], ["Confirmar Contraseña *", "ValidTest9!"]]) {
    fireEvent.change(screen.getByLabelText(label), {target: {value}});
  }
  fireEvent.submit(email.closest("form")!);
  expect(await screen.findByRole("alert")).toHaveTextContent(/correo válido/);
});
it("submits the forced shared form through its authenticated callback", async () => {
  const change = vi.fn(async () => {});
  render(<ForcePasswordChangeModal isOpen onPasswordChanged={change} onExit={vi.fn()} />);
  fireEvent.change(screen.getByLabelText("Contraseña actual o temporal"), {target:{value:"Temporary9!"}});
  fireEvent.change(screen.getByLabelText("Nueva contraseña"), {target:{value:"Definitive9!"}});
  fireEvent.change(screen.getByLabelText("Confirmar nueva contraseña"), {target:{value:"Definitive9!"}});
  fireEvent.click(screen.getByRole("button", {name:"Actualizar y Acceder al Panel"}));
  await waitFor(() => expect(change).toHaveBeenCalledExactlyOnceWith("Temporary9!", "Definitive9!"));
});
it("keeps all three password eyes independent", () => {
  render(<PasswordModal isOpen onClose={vi.fn()} onSuccess={vi.fn()} />);
  const current = screen.getByLabelText("Contraseña actual o temporal");
  const next = screen.getByLabelText("Nueva contraseña");
  const confirmation = screen.getByLabelText("Confirmar nueva contraseña");
  fireEvent.click(screen.getByRole("button", {name: "Mostrar nueva contraseña"}));
  expect(next).toHaveAttribute("type", "text");
  expect(current).toHaveAttribute("type", "password");
  expect(confirmation).toHaveAttribute("type", "password");
  fireEvent.click(screen.getByRole("button", {name: "Mostrar confirmación de contraseña"}));
  expect(confirmation).toHaveAttribute("type", "text");
  expect(current).toHaveAttribute("type", "password");
});
it("uses the same password dialog for mandatory changes without a dismiss action", () => {
  render(<ForcePasswordChangeModal isOpen onPasswordChanged={vi.fn()} onExit={vi.fn()} />);
  expect(screen.getByRole("dialog")).toHaveAccessibleName("Cambiar Contraseña");
  expect(screen.queryByRole("button", {name: "Cancelar"})).not.toBeInTheDocument();
  expect(screen.getByRole("button", {name: "Cerrar sesión y salir"})).toBeInTheDocument();
});
it("bounds a long location dropdown instead of expanding document overflow", () => {
  render(<CustomSelect label="Ciudad" value="" options={Array.from({length:32}, (_, i) => `Provincia ${i}`)} onChange={vi.fn()} />);
  fireEvent.click(screen.getByRole("button", {name: "Ciudad"}));
  const list = screen.getByRole("listbox");
  expect(list).toHaveStyle({maxHeight: "192px", overflowY: "auto", overscrollBehavior: "contain"});
});
it("shows a Spanish empty state when API has no municipalities", () => {
  render(<CustomSelect label="Municipio" value="" options={[]} onChange={vi.fn()} />);
  fireEvent.click(screen.getByRole("button", {name: "Municipio"}));
  expect(screen.getByText("No hay opciones disponibles.")).toBeInTheDocument();
});
