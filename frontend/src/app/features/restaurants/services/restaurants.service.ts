import { Injectable } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { OwnerRestaurant } from '../models/restaurant-owner.model';

@Injectable({ providedIn: 'root' })
export class RestaurantsService {

  constructor(private api: ApiService) {}

  // 🔍 Público
  getRestaurants(filters: any) {
    return this.api.get<any>('/restaurants/search', filters);
  }

  getRestaurantById(id: number) {
    return this.api.get<any>(`/restaurants/${id}`);
  }

  getRestaurantReviews(id: number) {
    return this.api.get<any>(`/restaurants/${id}/reviews`);
  }

  // ⭐ OWNER
getMyRestaurants() {
  return this.api.get<OwnerRestaurant[]>(
    '/restaurants/owner/my-restaurants'
  );
}


  createRestaurant(data: any) {
    return this.api.post('/restaurants', data);
  }

  createReview(restaurantId: number, data: any) {
    return this.api.post(`/restaurants/${restaurantId}/reviews`, data);
  }
}
