import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {

  private API_URL = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  // 👤 Perfil
  getMyProfile(): Observable<any> {
    return this.http.get(`${this.API_URL}/users/me`);
  }

  // ⭐ Mis reseñas
  getMyReviews(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/users/me/reviews`);
  }

  // ✏️ Editar reseña
  updateReview(reviewId: number, data: any): Observable<any> {
    return this.http.patch(
      `${this.API_URL}/reviews/${reviewId}`,
      data
    );
  }

  // 🗑️ Eliminar reseña
  deleteReview(reviewId: number): Observable<any> {
    return this.http.delete(
      `${this.API_URL}/reviews/${reviewId}`
    );
  }
}
