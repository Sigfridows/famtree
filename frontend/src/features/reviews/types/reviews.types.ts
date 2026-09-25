export type ReportReason = "spam" | "inappropriate" | "offensive" | "other";

export interface Asylum {
  id: string | number;
  name: string;
  colorIndex?: number;
}

export interface ReviewItem {
  codigo_reseña?: number;
  codigo_asilo?: number;
  asylumId?: string | number;
  asylumName?: string;
  
  calificacion?: number;
  rating?: number;
  
  comentario?: string;
  text?: string;
  
  fecha_creacion?: string;
  date?: string;
  
  id?: string | number;
  author?: string;
  avatar?: string;
  likes?: number;
  isLiked?: boolean;
}

export interface CreateReviewInput {
  codigo_asilo?: number;
  asylumId?: string | number;
  calificacion?: number;
  rating?: number;
  comentario?: string;
  text?: string;
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