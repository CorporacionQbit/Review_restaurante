import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet } from '@angular/router';

import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';

import { AuthService } from '../../../features/auth/auth.service';
import { RestaurantsService } from '../../../features/restaurants/services/restaurants.service';
import { OwnerRestaurant } from '../../../features/restaurants/models/restaurant-owner.model';

@Component({
  standalone: true,
  selector: 'app-layout',
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    NzLayoutModule,
    NzMenuModule,
    NzIconModule,
    NzButtonModule,
  ],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
})
export class LayoutComponent implements OnInit {

  role: string | null = null;
  hasRestaurants = false;

  constructor(
    private auth: AuthService,
    private restaurantsService: RestaurantsService,
    private router: Router
  ) {
    this.role = this.auth.getUserRole();
  }

  ngOnInit(): void {
    if (this.role === 'owner') {
      this.restaurantsService.getMyRestaurants().subscribe({
        next: (res: OwnerRestaurant[]) => {
          this.hasRestaurants = res.length > 0;
        },
        error: () => {
          this.hasRestaurants = false;
        }
      });
    }
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }
}
