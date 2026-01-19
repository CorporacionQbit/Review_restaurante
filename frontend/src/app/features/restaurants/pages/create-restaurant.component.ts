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

  // Archivos de documentos
  files: {
    RTU?: File;
    PATENTE?: File;
  } = {};

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
      categoryIds: [[], Validators.required],
    });

    this.loadCategories();
  }

  // =========================
  // CARGAR CATEGORÍAS
  // =========================
  loadCategories(): void {
    this.http.get<any[]>(`${this.API_URL}/categories`).subscribe({
      next: (data) => (this.categories = data),
      error: () => this.message.error('Error cargando categorías'),
    });
  }

  // =========================
  // CAPTURAR ARCHIVOS
  // =========================
  onFile(event: Event, type: 'RTU' | 'PATENTE') {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.files[type] = input.files[0];
    }
  }

  // =========================
  // SUBMIT (CREAR + DOCUMENTOS)
  // =========================
  submit(): void {
    if (this.form.invalid) {
      this.message.warning('Completa los campos obligatorios');
      return;
    }

    if (!this.files.RTU || !this.files.PATENTE) {
      this.message.warning('Debes subir RTU y Patente');
      return;
    }

    this.loading = true;

    const raw = this.form.value;

    const payload = {
      ...raw,
      priceRange: raw.priceRange ? Number(raw.priceRange) : null,
      zone: raw.zone || null,
      categoryIds: raw.categoryIds.map((id: any) => Number(id)),
    };

    //  Crear restaurante
    this.restaurantsService.createRestaurant(payload).subscribe({
      next: (restaurant: any) => {
        const id = restaurant.restaurantId;

        //  Subir documentos
        this.uploadDocument(id, 'RTU', this.files.RTU!);
        this.uploadDocument(id, 'PATENTE', this.files.PATENTE!);

        this.message.success('Restaurante creado y documentos enviados');
        this.loading = false;
      },
      error: () => {
        this.message.error('Error al crear el restaurante');
        this.loading = false;
      },
    });
  }

  // =========================
  // SUBIR DOCUMENTO
  // =========================
  uploadDocument(
    restaurantId: number,
    type: 'RTU' | 'PATENTE',
    file: File
  ) {
    const formData = new FormData();
    formData.append('file', file);

    this.http.post(
      `${this.API_URL}/restaurants/${restaurantId}/documents/${type}`,
      formData
    ).subscribe({
      error: () => {
        this.message.error(`Error subiendo ${type}`);
      },
    });
  }
}
