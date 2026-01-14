import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzMessageService } from 'ng-zorro-antd/message';

import { RestaurantsService } from '../../services/restaurants.service';
import { OwnerRestaurant } from '../../models/restaurant-owner.model';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzInputModule,
    NzCardModule,
  ],
  templateUrl: './restaurant-map.component.html',
  styleUrls: ['./restaurant-map.component.css'],
})export class RestaurantMapComponent implements OnInit {

  restaurantId!: number;
  restaurant!: OwnerRestaurant;

  // 🔹 INPUT (editable)
  mapsUrl = '';

  // 🔹 VALOR GUARDADO (persistente)
  savedMapsUrl = '';

  safeMapUrl: SafeResourceUrl | null = null;

  loading = true;
  saving = false;

  constructor(
    private route: ActivatedRoute,
    private restaurantsService: RestaurantsService,
    private sanitizer: DomSanitizer,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.restaurantId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadRestaurant();
  }

  private loadRestaurant(): void {
    this.restaurantsService
      .getRestaurantById(this.restaurantId)
      .subscribe({
        next: (res) => {
          this.restaurant = res;

          // 🔥 separar estados
          this.savedMapsUrl = res.mapsUrl || '';
          this.mapsUrl = this.savedMapsUrl;

          this.updatePreview(this.mapsUrl);
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  // =========================
  // PREVIEW (USA INPUT)
  // =========================
  updatePreview(value: string): void {
    if (!value) {
      this.safeMapUrl = null;
      return;
    }

    let url = value.trim();

    if (url.includes('maps.app.goo.gl')) {
      this.safeMapUrl = null;
      return;
    }

    if (url.includes('google.com/maps') && !url.includes('embed')) {
      const coordsMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);

      if (coordsMatch) {
        url = `https://www.google.com/maps?q=${coordsMatch[1]},${coordsMatch[2]}&output=embed`;
      } else {
        url = url.replace('/maps', '/maps/embed');
      }
    }

    this.safeMapUrl =
      this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  // =========================
  // GUARDAR
  // =========================
  saveMap(): void {
    if (!this.mapsUrl) {
      this.message.warning('Debes ingresar una URL');
      return;
    }

    this.saving = true;

    this.restaurantsService
      .updateRestaurant(this.restaurantId, {
        mapsUrl: this.mapsUrl,
      })
      .subscribe({
        next: () => {
          // 🔥 actualizar valor guardado
          this.savedMapsUrl = this.mapsUrl;

          this.message.success('Ubicación guardada correctamente');
          this.updatePreview(this.mapsUrl);
          this.saving = false;
        },
        error: (err) => {
          this.message.error(err.error?.message || 'Error al guardar');
          this.saving = false;
        }
      });
  }
}
