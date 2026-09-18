import { apiClient } from "@/lib/apiClient";
import { Asylum, AsylumStatus } from "@/types";

export interface AsylumFilters {
  search?: string;
  provinceId?: number;
  municipalityId?: number;
  minPrice?: number;
  maxPrice?: number;
  status?: AsylumStatus;
  serviceIds?: number[];
  page?: number;
  pageSize?: number;
  page_size?: number;
}

export interface CreateAsylumPayload {
  municipalityId: number;
  name: string;
  description: string;
  sector: string;
  address: string;
  latitude: number;
  longitude: number;
  totalCapacity: number;
  minPrice: number;
  maxPrice: number;
  entryRequirements: string;
  certifications?: string | null;
  phone: string;
  email: string;
  website?: string | null;
  serviceIds?: number[];
  seniorTypeIds?: number[];
}

export interface UpdateAsylumPayload extends Partial<CreateAsylumPayload> {
  status?: AsylumStatus;
}

export const asylumService = {
  getAsylums: async (filters?: AsylumFilters): Promise<Asylum[]> => {
    const response = await apiClient.get<Asylum[]>("/asylums", {
      params: filters,
    });
    return response.data;
  },

  getAsylumById: async (id: number): Promise<Asylum> => {
    const response = await apiClient.get<Asylum>(`/asylums/${id}`);
    return response.data;
  },

  createAsylum: async (payload: CreateAsylumPayload): Promise<Asylum> => {
    const response = await apiClient.post<Asylum>("/asylums", payload);
    return response.data;
  },

  updateAsylum: async (
    id: number,
    payload: UpdateAsylumPayload,
  ): Promise<Asylum> => {
    const response = await apiClient.put<Asylum>(`/asylums/${id}`, payload);
    return response.data;
  },

  deleteAsylum: async (id: number): Promise<void> => {
    await apiClient.delete(`/asylums/${id}`);
  },
};
