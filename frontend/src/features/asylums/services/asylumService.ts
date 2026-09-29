import { apiClient } from "@/lib/apiClient";
import type {
  AsylumDetail,
  AsylumFilters,
  AsylumPage,
} from "../types/asylum.types";

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
  images: {url: string}[];
  serviceIds: number[];
  seniorTypeIds: number[];
}

export type UpdateAsylumPayload = Partial<Omit<CreateAsylumPayload, "images">>;
export interface ManagedAsylum extends Omit<CreateAsylumPayload, "images"> { asylumId: number; status: "ACTIVE" | "INACTIVE"; }

export const asylumService = {
  /**
   * Obtiene la lista paginada y filtrada de asilos para el catálogo / mapa.
   */
  getAsylums: async (filters?: AsylumFilters): Promise<AsylumPage> => {
    const response = await apiClient.get<AsylumPage>("/asylums", {
      params: filters,
    });
    return response.data;
  },

  /**
   * Obtiene la información detallada de un asilo por ID.
   */
  getAsylumById: async (id: number): Promise<AsylumDetail> => {
    const response = await apiClient.get<AsylumDetail>(`/asylums/${id}`);
    return response.data;
  },

  /**
   * Crear un nuevo asilo (Panel de Administración).
   */
  createAsylum: async (payload: CreateAsylumPayload): Promise<ManagedAsylum> => {
    const response = await apiClient.post<ManagedAsylum>("/admin/asylums", payload);
    return response.data;
  },

  /**
   * Actualizar datos de un asilo existente.
   */
  updateAsylum: async (
    id: number,
    payload: UpdateAsylumPayload
  ): Promise<ManagedAsylum> => {
    const response = await apiClient.patch<ManagedAsylum>(`/admin/asylums/${id}`, payload);
    return response.data;
  },

  /**
   * Desactivar o eliminar un asilo.
   */
  deleteAsylum: async (id: number): Promise<void> => {
    await apiClient.patch(`/admin/asylums/${id}/deactivate`);
  },
};