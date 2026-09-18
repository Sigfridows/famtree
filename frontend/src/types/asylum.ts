export type AsylumStatus = "ACTIVE" | "INACTIVE";

export interface Province {
  provinceId: number;
  provinceName: string;
}

export interface Municipality {
  municipalityId: number;
  provinceId: number;
  municipalityName: string;
}

export interface SeniorType {
  seniorTypeId: number;
  typeName: string;
  isActive: boolean;
}

export interface Service {
  serviceId: number;
  serviceName: string;
  isActive: boolean;
}

export interface AsylumImage {
  imageId: number;
  asylumId: number;
  url: string;
  isCover: boolean;
  createdAt: string;
}

export interface Asylum {
  asylumId: number;
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
  certifications: string | null;
  phone: string;
  email: string;
  website: string | null;
  status: AsylumStatus;
  createdAt: string;
  updatedAt: string;
}