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
})
export class RestaurantMapComponent implements OnInit {

  restaurantId!: number;
  restaurant!: OwnerRestaurant;

  mapsUrl = '';
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
    this.restaurantId = Number(
      this.route.snapshot.paramMap.get('id')
    );

    this.loadRestaurant();
  }

  private loadRestaurant(): void {
    this.restaurantsService
      .getRestaurantById(this.restaurantId)
      .subscribe({
        next: (res) => {
          this.restaurant = res;
          this.mapsUrl = res.mapsUrl || '';
          this.updatePreview();
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  updatePreview(): void {
    if (!this.mapsUrl) {
      this.safeMapUrl = null;
      return;
    }

    this.safeMapUrl =
      this.sanitizer.bypassSecurityTrustResourceUrl(
        this.mapsUrl
      );
  }

  saveMap(): void {
    if (!this.mapsUrl) {
      this.message.warning(
        'Debes ingresar una URL de mapa'
      );
      return;
    }

    this.saving = true;

    this.restaurantsService
      .updateRestaurant(this.restaurantId, {
        mapsUrl: this.mapsUrl,
      })
      .subscribe({
        next: () => {
          this.message.success(
            'Ubicación guardada correctamente'
          );
          this.updatePreview();
          this.saving = false;
        },
        error: (err:any) => {
          this.message.error(
            err.error?.message || 'Error al guardar ubicación'
          );
          this.saving = false;
        }
      });
  }
}
