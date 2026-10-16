import { Star } from "lucide-react";

interface RatingSummaryProps {
  rating: number | null;
  reviewCount: number;
  className?: string;
  emptyLabel?: string;
}

/** A missing or provisional average is not a zero-star rating. */
export default function RatingSummary({ rating, reviewCount, className = "", emptyLabel = "Sin reseñas" }: RatingSummaryProps) {
  const hasPublishedAverage = reviewCount >= 3 && rating !== null && Number.isFinite(rating);
  const label = hasPublishedAverage
    ? `Calificación: ${rating.toFixed(1)} de 5, ${reviewCount} reseñas`
    : reviewCount === 0 ? emptyLabel : `${reviewCount} ${reviewCount === 1 ? "reseña" : "reseñas"}`;

  return <span className={`inline-flex items-center gap-1 ${className}`} aria-label={label} title={label}>
    {hasPublishedAverage ? <>
      <Star aria-hidden="true" className="h-3 w-3 shrink-0 fill-current" />
      <span>{rating.toFixed(1)}</span>
    </> : <span>{reviewCount === 0 ? emptyLabel : `${reviewCount} ${reviewCount === 1 ? "reseña" : "reseñas"}`}</span>}
  </span>;
}
