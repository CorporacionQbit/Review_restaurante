import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminUsersService {
 
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getUsers(page = 1, limit = 10) {
    return this.http.get<any>(`${this.baseUrl}/users`, {
      params: { page, limit },
    });
  }

  toggleUserStatus(userId: number, isActive: boolean) {
    const action = isActive ? 'deactivate' : 'activate';
    return this.http.patch(
      `${this.baseUrl}/users/admin/owners/${userId}/${action}`,
      {}
    );
  }
  getClients(page = 1, limit = 10) {
  return this.http.get<any>(`${this.baseUrl}/users/admin/clients`, {
    params: { page, limit },
  });
}
// ✅ ESTE ERA EL QUE FALTABA
  convertClientToOwner(userId: number): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/users/admin/clients/${userId}/convert-to-owner`,
      {}
    );
  }
}

