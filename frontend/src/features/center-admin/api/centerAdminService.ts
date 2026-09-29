import { apiClient } from "@/lib/apiClient";
import type { CenterInfo, CenterImage, CenterReputation, UpdateCenterPayload } from "../types/centerAdmin.types";

export const centerAdminService = {
  getMyCenterInfo: async (): Promise<CenterInfo> => (await apiClient.get<CenterInfo>("/center")).data,
  updateCenterInfo: async (payload: UpdateCenterPayload): Promise<CenterInfo> =>
    (await apiClient.patch<CenterInfo>("/center", payload)).data,
  getImages: async (): Promise<CenterImage[]> => (await apiClient.get<CenterImage[]>("/center/images")).data,
  uploadGalleryImages: async (formData: FormData): Promise<CenterImage> =>
    (await apiClient.post<CenterImage>("/center/images", formData)).data,
  setCover: async (id: number): Promise<CenterImage[]> =>
    (await apiClient.patch<CenterImage[]>(`/center/images/${id}/cover`)).data,
  removeImage: async (id: number): Promise<void> => { await apiClient.delete(`/center/images/${id}`); },
  getReviews: async (page = 1, q = "", rating?: number): Promise<CenterReputation> =>
    (await apiClient.get<CenterReputation>("/center/reviews", {params: {page, q: q || undefined, rating, sort: "newest"}})).data,
};
