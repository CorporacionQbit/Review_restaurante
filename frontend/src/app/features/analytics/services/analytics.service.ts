import { Injectable } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { Observable } from 'rxjs';
import { AnalyticsSummary } from '../analytics-summary.model';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {

  constructor(private api: ApiService) {}

getRestaurantSummary(
  restaurantId: number,
  range: '7d' | '30d' | '90d'
): Observable<AnalyticsSummary> {
  return this.api.get(
    `/analytics/restaurants/${restaurantId}/summary`,
    { range } // 👈 ASÍ, NO anidado
  );
}
getRestaurantTimeline(
  restaurantId: number,
  range: '7d' | '30d' | '90d'
) {
  return this.api.get<
    {
      date: string;
      views: number;
      clickMap: number;
      clickWebsite: number;
    }[]
  >(
    `/analytics/restaurants/${restaurantId}/timeline`,
    { range }
  );
}

getOwnerSummary(
  range: '7d' | '30d' | '90d'
) {
  return this.api.get<{
    restaurants: number;
    views: number;
    clickMap: number;
    clickWebsite: number;
    range: string;
  }>(
    '/analytics/owner/summary',
    { range }
  );
}


}
