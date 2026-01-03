import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';


@Injectable({ providedIn: 'root' })
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  get<T>(url: string, params?: Record<string, any>) {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }

    return this.http.get<T>(`${this.apiUrl}${url}`, {
      params: httpParams,
    });
  }

  post<T>(url: string, body: any) {
    return this.http.post<T>(`${this.apiUrl}${url}`, body);
  }

  put<T>(url: string, body: any) {
    return this.http.put<T>(`${this.apiUrl}${url}`, body);
  }

  // ✅ ESTE MÉTODO ES EL QUE TE FALTABA
  patch<T>(url: string, body?: any) {
    return this.http.patch<T>(`${this.apiUrl}${url}`, body);
  }

  delete<T>(url: string) {
    return this.http.delete<T>(`${this.apiUrl}${url}`);
  }
}