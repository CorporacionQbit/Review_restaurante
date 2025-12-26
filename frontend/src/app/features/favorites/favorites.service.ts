  import { Injectable } from '@angular/core';
  import { HttpClient } from '@angular/common/http';
  import { Observable } from 'rxjs';
@Injectable({ providedIn: 'root' })
export class FavoritesService {

  private API_URL = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  // 📋 Mis favoritos
  getMyFavorites() {
    return this.http.get<any[]>(
      `${this.API_URL}/favorites/me`
    );
  }

  // ❤️ Agregar
  addFavorite(restaurantId: number) {
    return this.http.post(
      `${this.API_URL}/favorites/${restaurantId}`,
      {} // body vacío
    );
  }

  // ❌ Quitar
  removeFavorite(restaurantId: number) {
    return this.http.delete(
      `${this.API_URL}/favorites/${restaurantId}`
    );
  }
}
  