import { apiClient } from "@/lib/apiClient";
import type {
  AsylumDetail,
  AsylumFilters,
  AsylumPage,
  AsylumStatus,
} from "../types/asylum.types";

export interface CreateAsylumPayload {
  municipality_id: number;
  name: string;
  description: string;
  sector: string;
  address: string;
  latitude: number;
  longitude: number;
  capacity: number;
  price_min: number;
  price_max: number;
  admission_requirements: string;
  certifications?: string | null;
  phone: string;
  email: string;
  website?: string | null;
  services?: number[];
  care_types?: number[];
}

export interface UpdateAsylumPayload extends Partial<CreateAsylumPayload> {
  status?: AsylumStatus;
}

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
  createAsylum: async (payload: CreateAsylumPayload): Promise<AsylumDetail> => {
    const response = await apiClient.post<AsylumDetail>("/asylums", payload);
    return response.data;
  },

  /**
   * Actualizar datos de un asilo existente.
   */
  updateAsylum: async (
    id: number,
    payload: UpdateAsylumPayload
  ): Promise<AsylumDetail> => {
    const response = await apiClient.put<AsylumDetail>(`/asylums/${id}`, payload);
    return response.data;
  },

  /**
   * Desactivar o eliminar un asilo.
   */
  deleteAsylum: async (id: number): Promise<void> => {
    await apiClient.delete(`/asylums/${id}`);
  },
};