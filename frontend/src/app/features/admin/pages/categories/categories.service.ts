import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Category {
  categoryId: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private API = 'http://localhost:3000/admin/categories';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Category[]> {
    return this.http.get<Category[]>(this.API);
  }

  create(data: { name: string }) {
    return this.http.post(this.API, data);
  }

  update(id: number, data: { name: string }) {
    return this.http.patch(`${this.API}/${id}`, data);
  }

  delete(id: number) {
    return this.http.delete(`${this.API}/${id}`);
  }
}
