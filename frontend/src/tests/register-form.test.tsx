import { act, renderHook } from "@testing-library/react";
import type { FormEvent } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useRegisterForm } from "@/features/auth/hooks/useRegisterForm";
import { ApiError } from "@/lib/apiClient";
const mocks = vi.hoisted(() => ({register: vi.fn(), push: vi.fn()}));
vi.mock("next/navigation", () => ({useRouter: () => ({push: mocks.push})}));
vi.mock("@/features/auth/hooks/useAuth", () => ({useAuth: () => ({register: mocks.register})}));
const event = {preventDefault: vi.fn()} as unknown as FormEvent;
function setup() {
  const hook = renderHook(() => useRegisterForm());
  act(() => {
    const h = hook.result.current.handlers;
    h.setUsername("Juan123"); h.setFirstName("José"); h.setLastName("Pérez");
    h.setEmail("juan@example.invalid"); h.setPassword("ValidTest9!"); h.setConfirmPassword("ValidTest9!");
  });
  return hook.result;
}
beforeEach(() => vi.resetAllMocks());
describe("registration", () => {
  it("checks password strength even without blur", async () => {
    const result = setup();
    act(() => {result.current.handlers.setPassword("abcdefgh"); result.current.handlers.setConfirmPassword("abcdefgh");});
    await act(() => result.current.handlers.handleSubmit(event));
    expect(mocks.register).not.toHaveBeenCalled();
    expect(result.current.formState.errorMessage).toContain("mayúscula");
  });
  it("requires confirmation", async () => {
    const result = setup();
    act(() => result.current.handlers.setConfirmPassword(""));
    await act(() => result.current.handlers.handleSubmit(event));
    expect(mocks.register).not.toHaveBeenCalled();
    expect(result.current.formState.errorMessage).toContain("Confirma");
  });
  it("rejects invalid usernames before sending", async () => {
    const result = setup();
    act(() => result.current.handlers.setUsername("juan.perez"));
    await act(() => result.current.handlers.handleSubmit(event));
    expect(mocks.register).not.toHaveBeenCalled();
    expect(result.current.formState.errorMessage).toContain("sin espacios ni puntos");
  });
  it("sends valid data and opens the catalog", async () => {
    const result = setup();
    mocks.register.mockResolvedValue({});
    await act(() => result.current.handlers.handleSubmit(event));
    expect(mocks.register).toHaveBeenCalledWith(expect.objectContaining({first_name: "José", confirmPassword: "ValidTest9!"}));
    expect(mocks.push).toHaveBeenCalledWith("/catalog");
  });
  it("translates API validation details without displaying sensitive values", async () => {
    const result = setup();
    mocks.register.mockRejectedValue(new ApiError("Request validation failed", 422, "validation_error", [{loc: ["body", "username"]}]));
    await act(() => result.current.handlers.handleSubmit(event));
    expect(result.current.formState.errorMessage).toContain("El usuario debe");
    expect(result.current.formState.errorMessage).not.toContain("Request validation failed");
  });
});

it("supports password visibility and validates required profile fields", async () => {
  const result = setup();
  act(() => { result.current.handlers.togglePasswordVisibility(); result.current.handlers.toggleConfirmPasswordVisibility(); result.current.handlers.setPasswordTouched(); });
  expect(result.current.formState.showPassword).toBe(true);
  expect(result.current.formState.showConfirmPassword).toBe(true);
  act(() => result.current.handlers.setFirstName(""));
  await act(() => result.current.handlers.handleSubmit(event));
  expect(result.current.formState.errorMessage).toContain("campos requeridos");
  act(() => result.current.handlers.setFirstName("A1"));
  await act(() => result.current.handlers.handleSubmit(event));
  expect(result.current.formState.errorMessage).toContain("El nombre");
  act(() => { result.current.handlers.setFirstName("Ana"); result.current.handlers.setEmail("invalid"); });
  await act(() => result.current.handlers.handleSubmit(event));
  expect(result.current.formState.errorMessage).toContain("correo válido");
  expect(mocks.register).not.toHaveBeenCalled();
});
