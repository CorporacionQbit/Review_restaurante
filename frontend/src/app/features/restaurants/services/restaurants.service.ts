import { Injectable } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';

import {
  OwnerRestaurant,
  RestaurantMenu
} from '../models/restaurant-owner.model';

@Injectable({ providedIn: 'root' })
export class RestaurantsService {

  constructor(private api: ApiService) {}

  /* =========================
     🌍 PÚBLICO
  ========================= */

  getRestaurants(filters: any) {
    return this.api.get<any>(
      '/restaurants/search',
      filters
    );
  }

  getRestaurantById(id: number) {
    return this.api.get<any>(
      `/restaurants/${id}`
    );
  }

  getRestaurantReviews(id: number) {
    return this.api.get<any>(
      `/restaurants/${id}/reviews`
    );
  }

  /* =========================
     ⭐ OWNER – RESTAURANTES
  ========================= */

  getMyRestaurants() {
    return this.api.get<OwnerRestaurant[]>(
      '/restaurants/owner/my-restaurants'
    );
  }

  createRestaurant(data: any) {
    return this.api.post(
      '/restaurants',
      data
    );
  }

  /* =========================
     🖼️ IMÁGENES (ETAPA 1)
  ========================= */

uploadImage(restaurantId: number, file: File) {
  const formData = new FormData();
  formData.append('file', file); // 🔥 CLAVE

  return this.api.post(
    `/restaurants/${restaurantId}/images`,
    formData
  );
}



  /* =========================
     📄 MENÚ (ETAPA 2 – PREMIUM)
  ========================= */

  getMenu(restaurantId: number) {
    return this.api.get<RestaurantMenu[]>(
      `/restaurants/${restaurantId}/menu`
    );
  }

  createMenu(
    restaurantId: number,
    data: { menuUrl: string; description?: string }
  ) {
    return this.api.post<RestaurantMenu>(
      `/restaurants/${restaurantId}/menu`,
      data
    );
  }

  deleteMenu(menuId: number) {
    return this.api.delete(
      `/menu/${menuId}`
    );
  }

  /* =========================
     ✍️ RESEÑAS
  ========================= */

  createReview(
    restaurantId: number,
    data: any
  ) {
    return this.api.post(
      `/restaurants/${restaurantId}/reviews`,
      data
    );
  }
  updateRestaurant(
  restaurantId: number,
  data: any
) {
  return this.api.put(
    `/restaurants/${restaurantId}`,
    data
  );
}

getPostsByRestaurant(restaurantId: number) {
  return this.api.get<any[]>(`/posts/restaurant/${restaurantId}`);
}

createPost(data: any) {
  return this.api.post('/posts', data);
}

updatePost(postId: number, data: any) {
  return this.api.put(`/posts/${postId}`, data);
}


deletePost(postId: number) {
  return this.api.delete(`/posts/${postId}`);
}
// POSTS PÚBLICOS DEL RESTAURANTE
getRestaurantPosts(restaurantId: number) {
  return this.api.get<any[]>(
    `/posts/restaurant/${restaurantId}`
  );
}

}
