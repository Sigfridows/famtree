import { apiRequest, ApiError, downloadApiFile } from "@/lib/apiClient";
import type {
  AdminCenter,
  AdminUser,
  Catalogs,
  Metrics,
  Page,
  ReportCase,
  ReportTable,
} from "./types";

export const adminApi = {
  metrics: (params: object) =>
    apiRequest<Metrics>("/admin/dashboard", { params }),
  centers: (params: object) =>
    apiRequest<Page<AdminCenter>>("/admin/asylums", { params }),
  center: (id: number) => apiRequest<AdminCenter>(`/admin/asylums/${id}`),
  saveCenter: (id: number | null, body: object) =>
    apiRequest<AdminCenter>(id ? `/admin/asylums/${id}` : "/admin/asylums", {
      method: id ? "PATCH" : "POST",
      body,
    }),
  setCenterStatus: (id: number, active: boolean) =>
    apiRequest<AdminCenter>(
      `/admin/asylums/${id}/${active ? "activate" : "deactivate"}`,
      { method: "PATCH" },
    ),
  catalogs: () => apiRequest<Catalogs>("/asylums/catalogs"),
  users: (params: object) =>
    apiRequest<Page<AdminUser>>("/admin/users", { params }),
  block: (id: number, reason: string) =>
    apiRequest<void>(`/admin/users/${id}/block`, {
      method: "PATCH",
      body: { reason },
    }),
  unblock: (id: number) =>
    apiRequest<void>(`/admin/users/${id}/unblock`, { method: "PATCH" }),
  createAdmin: (body: object) =>
    apiRequest<{
      user: AdminUser;
      temporaryPassword: string;
      emailDelivered: boolean;
    }>("/admin/asylum-admins", { method: "POST", body }),
  cases: (params: object) =>
    apiRequest<Page<ReportCase>>("/admin/review-reports", { params }),
  moderate: (id: number, status: string, justification: string) =>
    apiRequest(`/admin/review-reports/${id}/moderate`, {
      method: "PATCH",
      body: { status, justification },
    }),
  decisions: (offset = 0) =>
    apiRequest<Record<string, unknown>[]>("/admin/moderation-decisions", {
      params: { offset, limit: 20 },
    }),
  reports: (params: object) =>
    apiRequest<ReportTable>("/admin/reports", { params }),
  export: (body: object) => downloadApiFile("/admin/reports/export", body),
};

export function adminError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401)
      return "Tu sesión terminó. Inicia sesión de nuevo.";
    if (error.status === 403)
      return "Tu cuenta no tiene permiso para esta acción. Comprueba tu sesión y rol.";
    if (error.status === 422)
      return "Revisa los campos: formatos, longitudes, selección de servicios y rangos de fechas o precios.";
    if (error.status === 409)
      return "Los datos cambiaron o ya existe un registro con esos datos. Actualiza la lista y revisa tu selección.";
    if (error.status >= 500)
      return "No pudimos completar la operación. Inténtalo de nuevo en unos momentos.";
    return error.message;
  }
  return "No se pudo conectar con el servidor. Comprueba tu conexión e inténtalo de nuevo.";
}
