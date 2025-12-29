export interface OwnerRestaurant {
  restaurantId: number;
  ownerUserId: number;
  name: string;
  description?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  city?: string;
  zone?: string;
  mapsUrl?: string | null;
  priceRange?: number;

  avgRating: string;
  totalReviews: number;

  isApproved: boolean;
  isPremium: boolean;

  onboardingStatus: 'Pendiente' | 'Aprobado' | 'Rechazado';
  onboardingComment?: string | null;
}
