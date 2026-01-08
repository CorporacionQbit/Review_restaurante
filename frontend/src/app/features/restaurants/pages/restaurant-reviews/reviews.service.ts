import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ReviewsService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  /** OWNER – ver reseñas del restaurante */
  getRestaurantReviews(restaurantId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/restaurants/${restaurantId}/reviews`
    );
  }

  /** OWNER – reportar reseña */
  reportReview(
    reviewId: number,
    payload: { reason: string }
  ): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/reviews/${reviewId}/report`,
      payload
    );
  }
}
