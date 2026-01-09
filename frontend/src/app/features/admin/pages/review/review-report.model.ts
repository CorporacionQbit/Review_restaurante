export interface ReviewReport {
  reportId: number;
  reviewId: number;
  reason: string;
  isResolved: boolean;
  createdAt: string;

  review: {
    reviewId: number;
    rating: number;
    reviewText: string | null;
    status: 'Pendiente' | 'Aprobada' | 'Rechazada';
    createdAt: string;
  };

  user: {
    userId: number;
    fullName: string;
    email: string;
  };
}
