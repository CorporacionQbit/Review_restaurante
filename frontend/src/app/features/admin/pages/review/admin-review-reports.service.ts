import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminReviewReportsService {

  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  /* =========================
     REPORTES
  ========================= */

  // 🔹 Obtener reportes de reseñas
  getReports(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/admin/review-reports`
    );
  }

  // 🔹 Resolver reporte (sin eliminar reseña)
  resolveReport(reportId: number): Observable<any> {
    return this.http.patch(
      `${this.baseUrl}/admin/review-reports/${reportId}/resolve`,
      {}
    );
  }

  // 🔹 Eliminar reseña (admin)
  deleteReview(reviewId: number): Observable<any> {
    return this.http.delete(
      `${this.baseUrl}/admin/reviews/${reviewId}`
    );
  }

  /* =========================
     MODERACIÓN AVANZADA
  ========================= */

  // 🔹 Reseñas pendientes de aprobación
  getPendingReviews(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/admin/reviews/pending`
    );
  }

  // 🔹 Aprobar reseña
  approveReview(reviewId: number): Observable<any> {
    return this.http.patch(
      `${this.baseUrl}/admin/reviews/${reviewId}/approve`,
      {}
    );
  }

  // 🔹 Rechazar reseña (sin eliminar)
  rejectReview(
    reviewId: number,
    reason: string
  ): Observable<any> {
    return this.http.patch(
      `${this.baseUrl}/admin/reviews/${reviewId}/reject`,
      { reason }
    );
  }
}
