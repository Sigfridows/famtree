import type { CenterInfo } from "@/features/center-admin/types/centerAdmin.types";
import type { UserProfile } from "@/features/auth/types";

export type AdminUser = UserProfile;
export interface AdminCenter extends CenterInfo {
  propertyType: "CASA" | "APARTAMENTO" | "VILLA" | "GERIATRICO";
  municipalityId: number;
  sector: string;
  latitude: number;
  longitude: number;
  provinceId: number;
  provinceName: string;
  municipalityName: string;
  createdAt: string;
  updatedAt: string;
  administrator: { userId: number; name: string } | null;
}
export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
export interface Catalogs {
  provinces: { id: number; name: string }[];
  municipalities: { id: number; name: string; province_id: number }[];
  services: { id: number; name: string }[];
  care_types: { id: number; name: string }[];
}
export interface Metrics {
  centers: number;
  activeCenters: number;
  inactiveCenters: number;
  totalCapacity: number;
  registeredUsers: number;
  activeUsers: number;
  blockedUsers: number;
  centerAdministrators: number;
  publishedReviews: number;
  averageRating: number | null;
  favorites: number;
  pendingReports: number;
  centersByProvince: Record<string, number>;
  ratingDistribution: Record<string, number>;
  userRegistrationTrend: Record<string, number>;
}
export interface ReportCase {
  report_id: number;
  review_id: number;
  status: string;
  reason: string;
  detail: string | null;
  created_at: string;
  asylum_name: string;
  author_name: string;
  reporter_name: string;
  comment: string;
  rating: number;
  justification: string | null;
  resolved_at: string | null;
}
export interface ReportTable {
  rows: Record<string, unknown>[];
  total: number;
  page: number;
  pageSize: number;
}
