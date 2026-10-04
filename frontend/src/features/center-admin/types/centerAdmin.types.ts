export interface CenterInfo {
  asylumId: number;
  name: string;
  propertyType: "CASA" | "APARTAMENTO" | "VILLA" | "GERIATRICO";
  address: string;
  phone: string;
  email: string;
  minPrice: string;
  maxPrice: string;
  totalCapacity: number;
  description: string;
  entryRequirements: string;
  certifications: string | null;
  website: string | null;
  status: "ACTIVE" | "INACTIVE";
  serviceIds: number[];
  seniorTypeIds: number[];
}
export type UpdateCenterPayload = Partial<Pick<CenterInfo,
  "propertyType" | "phone" | "email" | "minPrice" | "maxPrice" | "totalCapacity" | "description" |
  "entryRequirements" | "certifications" | "website" | "serviceIds" | "seniorTypeIds"
>>;
export interface CenterImage { imageId: number; url: string; isCover: boolean; }
export interface CenterReview {
  reviewId: number; rating: number; comment: string; createdAt: string;
  author: {name: string; picture: string | null} | null; likes: number;
}
export interface CenterReputation {
  items: CenterReview[]; total: number; page: number; pageSize: number;
  summary: {average: number; count: number; distribution: Record<string, number>};
}
