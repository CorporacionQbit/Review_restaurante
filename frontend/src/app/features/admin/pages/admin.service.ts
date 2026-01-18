import { Injectable } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';

export interface AdminDashboardMetrics {
  users: number;
  restaurants: number;
  pendingRestaurants: number;
  pendingReviews: number;
}

export interface PendingRestaurant {
  restaurantId: number;
  name: string;
  city: string | null;
  zone: string | null;
  onboardingStatus: string;
  onboardingComment: string | null;
  owner: {
    userId: number;
    email: string;
    fullName: string;
  };
}

export interface RestaurantDocument {
  documentId: number;
  docType: 'RTU' | 'PATENTE';
  fileUrl: string;
  isVerified: boolean;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  constructor(private api: ApiService) {}

  getDashboardMetrics() {
    return this.api.get<AdminDashboardMetrics>(
      '/admin/dashboard/metrics'
    );
  }

  // 🍽️ RESTAURANTES PENDIENTES
  getPendingRestaurants(page = 1, limit = 10) {
    return this.api.get<{
      data: PendingRestaurant[];
      meta: {
        total: number;
        page: number;
        limit: number;
        lastPage: number;
      };
    }>(
      '/restaurants/admin/pending',
      { page, limit }
    );
  }

  approveRestaurant(restaurantId: number, isPremium = false) {
    return this.api.patch(
      `/restaurants/${restaurantId}/validate`,
      {
        isApproved: true,
        isPremium,
      }
    );
  }

  rejectRestaurant(
    restaurantId: number,
    comment: string
  ) {
    return this.api.patch(
      `/restaurants/${restaurantId}/validate`,
      {
        isApproved: false,
        onboardingComment: comment,
      }
    );
  }

  // ✅ NUEVO – OBTENER DOCUMENTOS
  getRestaurantDocuments(restaurantId: number) {
    return this.api.get<RestaurantDocument[]>(
      `/restaurants/${restaurantId}/documents`
    );
  }

  getRestaurantsHistory(page = 1, limit = 10) {
    return this.api.get<any>(
      '/restaurants/admin/history',
      { page, limit }
    );
  }
}
