import { apiClient } from "@/lib/apiClient";
import { ReportReason, Review, ReviewReport } from "@/types";

export interface CreateReviewPayload {
  asylumId: number;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
}

export interface UpdateReviewPayload {
  rating?: 1 | 2 | 3 | 4 | 5;
  comment?: string;
}

export interface ReportReviewPayload {
  reviewId: number;
  reason: ReportReason;
  detail?: string;
}

export const reviewService = {
  getReviewsByAsylum: async (asylumId: number): Promise<Review[]> => {
    const response = await apiClient.get<Review[]>(`/asylums/${asylumId}/reviews`);
    return response.data;
  },

  createReview: async (payload: CreateReviewPayload): Promise<Review> => {
    const response = await apiClient.post<Review>("/reviews", payload);
    return response.data;
  },

  updateReview: async (id: number, payload: UpdateReviewPayload): Promise<Review> => {
    const response = await apiClient.put<Review>(`/reviews/${id}`, payload);
    return response.data;
  },

  deleteReview: async (id: number): Promise<void> => {
    await apiClient.delete(`/reviews/${id}`);
  },

  reportReview: async (payload: ReportReviewPayload): Promise<ReviewReport> => {
    const response = await apiClient.post<ReviewReport>("/reviews/reports", payload);
    return response.data;
  },
};