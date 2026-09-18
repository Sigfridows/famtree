export type ReviewStatus = "PUBLISHED" | "HIDDEN";

export type ReportReason =
  | "OFFENSIVE_LANGUAGE"
  | "FALSE_INFO"
  | "SPAM"
  | "CONFLICT_OF_INTEREST"
  | "OTHER";

export type ReportStatus =
  | "PENDING"
  | "DISCARDED"
  | "REVIEW_REMOVED";

export interface Review {
  reviewId: number;
  userId: number;
  asylumId: number;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string | null;
}

export interface ReviewReport {
  reportId: number;
  reviewId: number;
  reporterUserId: number;
  moderatorUserId: number | null;
  reason: ReportReason;
  detail: string | null;
  justification: string | null;
  status: ReportStatus;
  createdAt: string;
  resolvedAt: string | null;
}