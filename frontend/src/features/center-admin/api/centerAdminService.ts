import { apiClient } from "@/lib/apiClient";
import { CenterInfo, UpdateCenterPayload } from "../types/centerAdmin.types";

export const centerAdminService = {
  // Obtener la información del centro administrado por el usuario logueado
  getMyCenterInfo: async (): Promise<CenterInfo> => {
    const response = await apiClient.get<CenterInfo>("/center-admin/my-center");
    return response.data;
  },

  // Actualizar datos de contacto, precios e información general
  updateCenterInfo: async (payload: UpdateCenterPayload): Promise<CenterInfo> => {
    const response = await apiClient.patch<CenterInfo>("/center-admin/my-center", payload);
    return response.data;
  },

  // Subir / Eliminar imágenes de la galería
  uploadGalleryImages: async (formData: FormData): Promise<{ images: string[] }> => {
    const response = await apiClient.post<{ images: string[] }>("/center-admin/my-center/gallery", formData);
    return response.data;
  },
};