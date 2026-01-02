import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzMessageService } from 'ng-zorro-antd/message';

import { RestaurantsService } from '../../services/restaurants.service';
import {
  OwnerRestaurant,
  RestaurantMenu
} from '../../models/restaurant-owner.model';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzInputModule,
    NzCardModule,
  ],
  templateUrl: './restaurant-menu.component.html',
  styleUrls: ['./restaurant-menu.component.css'],
})
export class RestaurantMenuComponent implements OnInit {

  restaurantId!: number;
  restaurant!: OwnerRestaurant;

  menu: RestaurantMenu | null = null;

  menuUrl = '';
  description = '';

  loading = true;
  saving = false;

  constructor(
    private route: ActivatedRoute,
    private restaurantsService: RestaurantsService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.restaurantId = Number(
      this.route.snapshot.paramMap.get('id')
    );

    this.loadRestaurant();
    this.loadMenu();
  }

  private loadRestaurant(): void {
    this.restaurantsService
      .getRestaurantById(this.restaurantId)
      .subscribe({
        next: (res: OwnerRestaurant) => {
          this.restaurant = res;
        }
      });
  }

  private loadMenu(): void {
    this.restaurantsService
      .getMenu(this.restaurantId)
      .subscribe({
        next: (menus: RestaurantMenu[]) => {
          this.menu = menus.length ? menus[0] : null;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  createMenu(): void {
    if (!this.menuUrl) {
      this.message.warning(
        'Debes ingresar la URL del menú'
      );
      return;
    }

    this.saving = true;

    this.restaurantsService
      .createMenu(this.restaurantId, {
        menuUrl: this.menuUrl,
        description: this.description,
      })
      .subscribe({
        next: (menu: RestaurantMenu) => {
          this.menu = menu;
          this.menuUrl = '';
          this.description = '';
          this.message.success(
            'Menú agregado correctamente'
          );
          this.saving = false;
        },
        error: (err) => {
          this.message.error(
            err.error?.message || 'Error al crear menú'
          );
          this.saving = false;
        }
      });
  }

  deleteMenu(): void {
    if (!this.menu) return;

    this.restaurantsService
      .deleteMenu(this.menu.menuId)
      .subscribe({
        next: () => {
          this.menu = null;
          this.message.success('Menú eliminado');
        }
      });
  }
}
