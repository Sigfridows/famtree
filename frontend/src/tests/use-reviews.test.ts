import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useReviews } from '@/features/reviews/hooks/useReviews';
import { reviewService } from '@/features/reviews/api/reviewService';
import { apiClient } from '@/lib/apiClient';

vi.mock('@/features/reviews/api/reviewService', () => ({
  reviewService: {
    getAllReviews: vi.fn(),
    getReviewsByAsylum: vi.fn(),
    createReview: vi.fn(),
    toggleLikeReview: vi.fn(),
    getAsylums: vi.fn(),
  },
}));

vi.mock('@/lib/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('useReviews Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe cargar las reseñas y asilos correctamente al iniciar', async () => {
    const mockReviews = [
      { id: '1', text: 'Muy buen servicio', author: 'Wilson Segura', likes: 3, isLiked: false }
    ];
    const mockAsylums = [{ id: '1', name: 'Asilo Esperanza' }];

    vi.mocked(reviewService.getAllReviews).mockResolvedValue(mockReviews);
    vi.mocked(reviewService.getAsylums).mockResolvedValue(mockAsylums);
    vi.mocked(apiClient.get).mockResolvedValue({ data: mockAsylums });

    const { result } = renderHook(() => useReviews());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.reviews).toEqual(mockReviews);
    expect(result.current.asylums).toEqual(mockAsylums);
    expect(result.current.error).toBeNull();
  });

  it('debe manejar los errores correctamente cuando falla la API al cargar', async () => {
    vi.mocked(reviewService.getAllReviews).mockRejectedValueOnce(new Error('Error de conexión'));
    vi.mocked(reviewService.getAsylums).mockResolvedValueOnce([]);

    const { result } = renderHook(() => useReviews());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Error de conexión');
    expect(result.current.reviews).toEqual([]);
  });

  it('debe permitir alternar el like de una reseña correctamente', async () => {
    const mockReviews = [
      { id: '1', text: 'Reseña de prueba', author: 'Wilson Segura', likes: 2, isLiked: false }
    ];

    vi.mocked(reviewService.getAllReviews).mockResolvedValue(mockReviews);
    vi.mocked(reviewService.getAsylums).mockResolvedValue([]);
    vi.mocked(reviewService.toggleLikeReview).mockResolvedValue(undefined);

    const { result } = renderHook(() => useReviews());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.toggleLike('1');
    });

    await waitFor(() => {
      expect(result.current.reviews[0].isLiked).toBe(true);
      expect(result.current.reviews[0].likes).toBe(3);
    });
  });

  it('debe revertir el estado si falla la llamada a toggleLike', async () => {
    const mockReviews = [
      { id: '1', text: 'Reseña de prueba', author: 'Wilson Segura', likes: 2, isLiked: false }
    ];

    vi.mocked(reviewService.getAllReviews).mockResolvedValue(mockReviews);
    vi.mocked(reviewService.getAsylums).mockResolvedValue([]);
    vi.mocked(reviewService.toggleLikeReview).mockRejectedValueOnce(new Error('Fallo de red'));

    const { result } = renderHook(() => useReviews());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      try {
        await result.current.toggleLike('1');
      } catch {
        // Se ignora el rechazo intencional para verificar el rollback
      }
    });

    await waitFor(() => {
      expect(result.current.reviews[0].isLiked).toBe(false);
      expect(result.current.reviews[0].likes).toBe(2);
      expect(result.current.error).toBeNull();
    });
  });

  it('debe agregar una nueva reseña con submitReview', async () => {
    const newReview = { id: '2', text: 'Nueva reseña', author: 'Wilson Segura', likes: 0, isLiked: false };

    vi.mocked(reviewService.getAllReviews).mockResolvedValue([]);
    vi.mocked(reviewService.getAsylums).mockResolvedValue([]);
    vi.mocked(reviewService.createReview).mockResolvedValueOnce(newReview);

    const { result } = renderHook(() => useReviews());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.submitReview({ comment: 'Nueva reseña', asylumId: '1', rating: 5 });
    });

    expect(result.current.reviews).toContainEqual(newReview);
  });
});