import type { AsylumDetail } from '../types/asylum.types';
import type { AsiloDetailData } from '../components/AsiloDetails';

export function toDetailData(center: AsylumDetail): AsiloDetailData {
  return {
    id: String(center.id), title: center.name, address: center.address,
    province: center.province_name, municipality: center.municipality_name, sector: center.sector,
    latitude: center.latitude, longitude: center.longitude,
    schedule: '', email: center.email, phone: center.phone, website: center.website ?? undefined,
    admin: 'Administración', capacity: center.capacity,
    entryRequirements: center.admission_requirements, certifications: center.certifications,
    updatedAt: center.updated_at, priceMin: Number(center.price_min), priceMax: Number(center.price_max),
    description: center.description, rating: center.rating ?? 0, reviewsCount: center.review_count,
    images: center.images.length ? center.images.map(image => image.url) : center.cover_url ? [center.cover_url] : [],
    services: center.services, careTypes: center.care_types,
  };
}
