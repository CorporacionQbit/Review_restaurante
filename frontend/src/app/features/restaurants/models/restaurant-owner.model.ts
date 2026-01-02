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
  mapsUrl?: string;

  priceRange?: number;
  avgRating: string;
  totalReviews: number;

  isApproved: boolean;
  isPremium: boolean;
  onboardingStatus: 'Pendiente' | 'Aprobado' | 'Rechazado';
  onboardingComment?: string;

  images: RestaurantImage[];
  menus: RestaurantMenu[];
  posts: RestaurantPost[];
}

/* =========================
   SUB MODELS
========================= */

export interface RestaurantImage {
  imageId: number;
  imageUrl: string;
  isVerified: boolean;
  isVisible: boolean;
  createdAt: string;
}

export interface RestaurantMenu {
  menuId: number;
  menuUrl: string;
  description?: string;
}

export interface RestaurantPost {
  postId: number;
  title: string;
  content: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
}
