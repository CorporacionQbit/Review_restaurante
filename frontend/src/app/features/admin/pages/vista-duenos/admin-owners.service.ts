import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminOwnersService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getOwners(page = 1, limit = 10): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/users/admin/owners?page=${page}&limit=${limit}`,
    );
  }

  getOwnerRestaurants(userId: number): Observable<any[]> {
  return this.http.get<any[]>(
    `${this.baseUrl}/users/admin/owners/${userId}/restaurants`,
  );
}

}
