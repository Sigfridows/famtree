/** Matches the public discovery OpenAPI schemas. Monetary amounts remain decimal strings. */
export type SortOrder = "name_asc" | "price_asc" | "price_desc" | "rating_desc";

export type AsylumFilters = {
  q?: string;
  province_id?: number;
  municipality_id?: number;
  min_price?: string;
  max_price?: string;
  services?: number[];
  care_types?: number[];
  certified_only?: boolean;
  rating_min?: number;
  sort?: SortOrder;
  page?: number;
};

export type AppliedFilters = {
  q: string | null;
  province_id: number | null;
  municipality_id: number | null;
  min_price: string | null;
  max_price: string | null;
  services: number[];
  care_types: number[];
  certified_only: boolean;
  rating_min: number | null;
  sort: SortOrder;
  page: number;
};

export type CatalogOption = { id: number; name: string };
export type MunicipalityOption = CatalogOption & { province_id: number };
export type AsylumCatalogs = {
  provinces: CatalogOption[];
  municipalities: MunicipalityOption[];
  services: CatalogOption[];
  care_types: CatalogOption[];
};

export type AsylumSummary = {
  id: number;
  name: string;
  province_id: number;
  province_name: string;
  municipality_id: number;
  municipality_name: string;
  sector: string;
  address: string;
  latitude: number;
  longitude: number;
  price_min: string;
  price_max: string;
  cover_url: string | null;
  rating: number | null;
  review_count: number;
};

export type AsylumImage = { id: number; url: string; is_cover: boolean };
export type AsylumDetail = AsylumSummary & {
  description: string;
  admission_requirements: string;
  capacity: number;
  certifications: string | null;
  phone: string;
  email: string;
  website: string | null;
  images: AsylumImage[];
  services: CatalogOption[];
  care_types: CatalogOption[];
};

export type Pagination = { page: number; page_size: number; total: number; pages: number };
export type DiscoveryPage<T> = { items: T[]; pagination: Pagination; filters: AppliedFilters };
export type AsylumPage = DiscoveryPage<AsylumSummary>;
