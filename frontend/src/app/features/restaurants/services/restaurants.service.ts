import { Injectable } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';

@Injectable({ providedIn: 'root' })
export class RestaurantsService {

  constructor(private api: ApiService) {}

  getRestaurants(filters: any) {
    return this.api.get<any>('/restaurants/search', filters);
  }

  getRestaurantById(id: number) {
    return this.api.get<any>(`/restaurants/${id}`);
  }

  getRestaurantReviews(id: number) {
    return this.api.get<any>(`/restaurants/${id}/reviews`);
  }

  createReview(restaurantId: number, data: any) {
    return this.api.post(`/restaurants/${restaurantId}/reviews`, data);
  }
}
