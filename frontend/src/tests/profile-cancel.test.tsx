import "@testing-library/jest-dom/vitest";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ProfileForm } from "@/features/profile/components/ProfileForm";
import { profileService } from "@/features/profile/api/profileService";
import type { User } from "@/features/profile/types/profile.types";

vi.mock("next/navigation", () => ({useRouter: () => ({push: vi.fn()})}));
const auth = vi.hoisted(() => ({user: {userId: 1, role: "REGISTERED_USER"}, isLoading: false, logout: vi.fn()}));
vi.mock("@/features/auth/hooks/useAuth", () => ({useAuth: () => auth}));
vi.mock("@/features/profile/api/profileService", () => ({profileService: {getProfile: vi.fn(), updateProfile: vi.fn(), uploadAvatar: vi.fn(), removeAvatar: vi.fn()}}));
vi.mock("@/features/asylums/api/discovery", () => ({getAsylumCatalogs: async () => ({provinces: [], municipalities: []})}));
vi.mock("@/features/notifications/api/notificationsService", () => ({notificationsService: {getPreferences: async () => ({availabilityAlert: false, moderationAlert: false, updateAlert: false})}}));
let stored: User;
beforeEach(() => {
  vi.clearAllMocks();
  stored = {userId: 1, firstName: "Prueba", lastName: "Usuario", username: "prueba", email: "prueba@example.invalid", role: "REGISTERED_USER", status: "ACTIVE", profilePicture: "/foto.jpg", phone: null, description: null, assignedAsylumId: null, requiresPasswordChange: false, createdAt: "2026-10-01T00:00:00Z"};
  vi.mocked(profileService.getProfile).mockImplementation(async () => ({...stored}));
  vi.mocked(profileService.removeAvatar).mockImplementation(async () => {stored.profilePicture = null;});
});
afterEach(cleanup);
describe("profile edit draft", () => {
  it("does not persist photo removal when the edit is cancelled", async () => {
    render(<ProfileForm />);
    fireEvent.click(await screen.findByRole("button", {name: "Editar perfil"}));
    fireEvent.click(screen.getByRole("button", {name: "Quitar"}));
    expect(profileService.removeAvatar).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", {name: "Cancelar"}));
    await screen.findByRole("button", {name: "Editar perfil"});
    expect(profileService.removeAvatar).not.toHaveBeenCalled();
    expect(screen.getByRole("img", {name: "prueba"})).toBeInTheDocument();
  });
  it("persists removal only on Save and reads back the resulting profile", async () => {
    render(<ProfileForm />);
    fireEvent.click(await screen.findByRole("button", {name: "Editar perfil"}));
    fireEvent.click(screen.getByRole("button", {name: "Quitar"}));
    fireEvent.click(screen.getByRole("button", {name: "Guardar Cambios"}));
    await waitFor(() => expect(profileService.removeAvatar).toHaveBeenCalledOnce());
    await screen.findByRole("button", {name: "Editar perfil"});
    expect(screen.queryByRole("img", {name: "prueba"})).not.toBeInTheDocument();
  });
});
