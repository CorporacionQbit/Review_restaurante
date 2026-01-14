import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzMessageService } from 'ng-zorro-antd/message';

import { RestaurantsService } from '../services/restaurants.service';

@Component({
  standalone: true,
  selector: 'app-restaurant-dashboard',
  imports: [
    CommonModule,
    NzButtonModule,
    NzTagModule,
  ],
  templateUrl: './restaurant-dashboard.component.html',
  styleUrls: ['./restaurant-dashboard.component.css'],
})
export class RestaurantDashboardComponent implements OnInit {

  restaurantId!: number;
  restaurant: any;

  loading = true;
  progress = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private restaurantsService: RestaurantsService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.restaurantId = Number(this.route.snapshot.paramMap.get('id'));

    if (!this.restaurantId) {
      this.message.error('Restaurante no válido');
      this.router.navigate(['/restaurants']);
      return;
    }

    this.loadRestaurant();
  }

  loadRestaurant(): void {
    this.loading = true;

    this.restaurantsService.getRestaurantById(this.restaurantId).subscribe({
      next: (res) => {
        this.restaurant = res;
        this.calculateProgress();
        this.loading = false;
      },
      error: () => {
        this.message.error('No se pudo cargar el restaurante');
        this.router.navigate(['/restaurants']);
      },
    });
  }

  // =========================
  // PROGRESO DEL PERFIL (FRONTEND)
  // =========================
  calculateProgress(): void {
    let completed = 0;
    let total = 2; // imágenes + ubicación (siempre cuentan)

    // 📸 Imágenes
    if (this.restaurant.images?.length > 0) {
      completed++;
    }

    // 🗺️ Ubicación
    if (this.restaurant.mapsUrl) {
      completed++;
    }

    // ⭐ Funcionalidades Premium
    if (this.restaurant.isPremium) {
      total += 2;

      // 📄 Menú
      if (this.restaurant.menus?.length > 0) {
        completed++;
      }

      // 📰 Posts
      if (this.restaurant.posts?.length > 0) {
        completed++;
      }
    }

    this.progress = Math.round((completed / total) * 100);
  }

  // =========================
  // TEXTO DINÁMICO DE AYUDA
  // =========================
  get missingSteps(): string {
    if (!this.restaurant) return '';

    const missing: string[] = [];

    if (!this.restaurant.images?.length) missing.push('imágenes');
    if (!this.restaurant.mapsUrl) missing.push('ubicación');

    if (this.restaurant.isPremium) {
      if (!this.restaurant.menus?.length) missing.push('menú');
      if (!this.restaurant.posts?.length) missing.push('posts');
    }

    return missing.length
      ? `Faltan ${missing.join(' y ')}`
      : 'Perfil completo 🎉';
  }

  go(section: string): void {
    this.router.navigate(['/restaurants', this.restaurantId, section]);
  }
}
