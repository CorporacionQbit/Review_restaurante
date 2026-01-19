import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminUsersService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  toggleUserStatus(userId: number, isActive: boolean) {
    const action = isActive ? 'deactivate' : 'activate';
    return this.http.patch(
      `${this.baseUrl}/users/admin/owners/${userId}/${action}`,
      {}
    );
  }

  // ✅ CLIENTES CON FILTROS Y PAGINACIÓN REAL (BACKEND)
  getClients(
    page = 1,
    limit = 10,
    filters?: { search?: string; status?: 'active' | 'inactive' | null }
  ) {
    const params: any = { page, limit };

    if (filters?.search?.trim()) {
      params.search = filters.search;
    }

    if (filters?.status) {
      params.status = filters.status;
    }

    return this.http.get<any>(
      `${this.baseUrl}/users/admin/clients`,
      { params }
    );
  }

  convertClientToOwner(userId: number): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/users/admin/clients/${userId}/convert-to-owner`,
      {}
    );
  }
}
