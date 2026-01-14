import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormGroup,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzMessageService } from 'ng-zorro-antd/message';

import { RestaurantsService } from '../services/restaurants.service';

@Component({
  standalone: true,
  selector: 'app-create-restaurant',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzInputModule,
    NzButtonModule,
    NzSelectModule,
  ],
  templateUrl: './create-restaurant.component.html',
  styleUrls: ['./create-restaurant.component.css'],
})
export class CreateRestaurantComponent implements OnInit {

  form!: FormGroup;
  loading = false;

  categories: any[] = [];

  private API_URL = 'http://localhost:3000';

  constructor(
    private fb: FormBuilder,
    private restaurantsService: RestaurantsService,
    private http: HttpClient,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      phoneNumber: [''],
      email: ['', Validators.email],
      address: [''],
      city: [''],
      zone: [''],
      mapsUrl: [''],
      priceRange: [null],

      // categorías seleccionadas por el dueño
      categoryIds: [[], Validators.required],
    });

    this.loadCategories();
  }

  // 🔹 CATEGORÍAS PÚBLICAS (OWNER)
  loadCategories(): void {
    this.http.get<any[]>(`${this.API_URL}/categories`).subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: () => {
        this.message.error('Error cargando categorías');
      },
    });
  }

  submit(): void {
  if (this.form.invalid) {
    this.message.warning('Completa los campos obligatorios');
    return;
  }

  this.loading = true;

  const raw = this.form.value;

  const payload = {
    ...raw,
    priceRange: raw.priceRange ? Number(raw.priceRange) : null,
    zone: raw.zone ? String(raw.zone) : null,
    categoryIds: (raw.categoryIds || []).map((id: any) => Number(id)),
  };

  this.restaurantsService.createRestaurant(payload).subscribe({
    next: () => {
      this.message.success('Restaurante creado correctamente');
      this.loading = false;
    },
    error: (err) => {
      console.error('BACKEND ERROR:', err);
      this.message.error('Error al crear el restaurante');
      this.loading = false;
    },
  });
}

}
