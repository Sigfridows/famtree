import { apiClient } from "@/lib/apiClient";
import { ReviewItem, CreateReviewInput, ReportReason, ReviewReport, ReviewReaction, Asylum } from "../types/reviews.types";

export const reviewService = {
  // Obtener la lista general de asilos
  getAsylums: async (): Promise<Asylum[]> => {
    const result: Asylum[] = [];
    let page = 1;
    while (true) {
      const {data} = await apiClient.get<{items: Asylum[]; pagination: {pages: number}}>("/asylums", {params: {page}});
      result.push(...data.items);
      if (page >= data.pagination.pages) return result;
      page++;
    }
  },

  // Obtener reseñas de un asilo específico (Endpoint válido según Swagger)
  getReviewsByAsylum: async (asylumId: number | string): Promise<ReviewItem[]> => {
    const result: ReviewItem[] = [];
    let offset = 0;
    while (true) {
      const {data} = await apiClient.get<ReviewItem[]>(`/asylums/${asylumId}/reviews`, {params: {offset, limit: 100}});
      result.push(...data);
      if (data.length < 100) return result;
      offset += data.length;
    }
  },

  // Obtener todas las reseñas acumulando las de cada asilo
  getAllReviews: async (centers?: Asylum[]): Promise<ReviewItem[]> => {
    const asylums = centers ?? await reviewService.getAsylums();
    
    // Peticiones en paralelo para las reseñas de cada asilo registrado
    const reviewsPromises = asylums.map((asylum) =>
      reviewService.getReviewsByAsylum(asylum.id)
    );

    const reviewsNested = await Promise.all(reviewsPromises);
    return reviewsNested.flat();
  },

  // Crear una nueva reseña
  createReview: async (payload: CreateReviewInput): Promise<ReviewItem> => {
    const response = await apiClient.post<ReviewItem>("/reviews", payload);
    return response.data;
  },

  updateReview: async (id: string, payload: {rating: number; comment: string}): Promise<ReviewItem> =>
    (await apiClient.patch<ReviewItem>(`/reviews/${id}`, payload)).data,

  // Toggle Like en una reseña
  toggleLikeReview: async (id: string | number): Promise<ReviewReaction> => {
    const {data} = await apiClient.post<ReviewReaction>(`/reviews/${id}/like`);
    return data;
  },

  // Reportar reseña
  reportReview: async (reviewId: number, reason: ReportReason, detail?: string): Promise<ReviewReport> => {
    const response = await apiClient.post<ReviewReport>("/reviews/reports", { reviewId, reason, detail });
    return response.data;
  },
};