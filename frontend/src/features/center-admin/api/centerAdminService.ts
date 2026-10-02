import { apiClient } from "@/lib/apiClient";
import { ApiError } from "@/lib/apiClient";
import { env } from "@/config/env";
import type {
  CenterInfo,
  CenterImage,
  CenterReputation,
  UpdateCenterPayload,
} from "../types/centerAdmin.types";

export const centerAdminService = {
  getMyCenterInfo: async (): Promise<CenterInfo> =>
    (await apiClient.get<CenterInfo>("/center")).data,
  updateCenterInfo: async (payload: UpdateCenterPayload): Promise<CenterInfo> =>
    (await apiClient.patch<CenterInfo>("/center", payload)).data,
  getImages: async (): Promise<CenterImage[]> =>
    (await apiClient.get<CenterImage[]>("/center/images")).data,
  uploadGalleryImages: (
    formData: FormData,
    onProgress?: (percent: number) => void,
  ): Promise<CenterImage> =>
    new Promise((resolve, reject) => {
      const request = new XMLHttpRequest();
      request.open("POST", `${env.apiBaseUrl}/center/images`);
      request.withCredentials = true;
      request.timeout = 120000;
      request.upload.onprogress = (event) => {
        if (event.lengthComputable)
          onProgress?.(Math.round((event.loaded / event.total) * 100));
      };
      request.onload = () => {
        let body;
        try {
          body = JSON.parse(request.responseText);
        } catch {
          reject(new Error("El servidor devolvió una respuesta inesperada."));
          return;
        }
        if (request.status >= 200 && request.status < 300) resolve(body);
        else
          reject(
            new ApiError(
              body.error?.message || "No se pudo subir la imagen.",
              request.status,
              body.error?.code,
            ),
          );
      };
      request.onerror = () =>
        reject(new Error("No se pudo conectar para subir la imagen."));
      request.ontimeout = () =>
        reject(
          new Error(
            "La subida tardó demasiado. Comprueba la galería antes de reintentar.",
          ),
        );
      request.send(formData);
    }),
  setCover: async (id: number): Promise<CenterImage[]> =>
    (await apiClient.patch<CenterImage[]>(`/center/images/${id}/cover`)).data,
  removeImage: async (id: number): Promise<void> => {
    await apiClient.delete(`/center/images/${id}`);
  },
  getReviews: async (
    page = 1,
    q = "",
    rating?: number,
    sort = "newest",
  ): Promise<CenterReputation> =>
    (
      await apiClient.get<CenterReputation>("/center/reviews", {
        params: { page, q: q || undefined, rating, sort },
      })
    ).data,
};
