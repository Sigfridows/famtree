export type ReportReason = "SPAM" | "FALSE_INFO" | "OFFENSIVE_LANGUAGE" | "CONFLICT_OF_INTEREST" | "OTHER";

export interface Asylum {
  id: string | number;
  name: string;
  colorIndex?: number;
}

export interface ReviewItem {
  id?: string | number;
  reviewId?: number;
  userId?: number;
  createdAt?: string;
  codigo_reseña?: number;
  asylumId?: string | number;
  codigo_asilo?: number;
  asylumName?: string;
  
  rating?: number;
  calificacion?: number;
  
  comment?: string;
  comentario?: string;
  text?: string;
  
  author?: string | {name: string; picture: string | null};
  avatar?: string;
  likes?: number;
  isLiked?: boolean;
  date?: string;
  fecha_creacion?: string;
}

// Payload exacto que la API requiere para POST /reviews
export interface CreateReviewInput {
  asylumId: number | string;
  rating: number;
  comment: string;
}

export interface ReportReviewPayload {
  reviewId: number;
  reason: ReportReason;
  detail?: string;
}

export interface ReviewReport {
  id: number;
  reviewId: number;
  reason: ReportReason;
  detail?: string;
}
export interface ReviewReaction { reviewId: number; likes: number; isLiked: boolean; }
