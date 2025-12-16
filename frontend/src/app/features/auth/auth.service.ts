import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from './../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  login(data: { email: string; password: string }) {
    return this.http.post<any>(`${this.api}/auth/login`, data);
  }

  saveToken(token: string) {
    localStorage.setItem('access_token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout() {
    localStorage.removeItem('access_token');
  }
  getUserRole(): string | null {
  const token = this.getToken();
  if (!token) return null;

  const payload = JSON.parse(atob(token.split('.')[1]));
  return payload.role || null;
}
register(data: {
  email: string;
  password: string;
  fullName: string;
}) {
  return this.http.post<any>(`${this.api}/auth/register`, data);
}
}