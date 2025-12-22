import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';

export const RESTAURANTS_ROUTES: Routes = [

  // 🔒 OWNER – dashboard
  {
    path: '',
    canActivate: [
      authGuard,
      roleGuard(['owner']),
    ],
    loadComponent: () =>
      import('./pages/restaurants-owner.component')
        .then(m => m.RestaurantsOwnerComponent),
  },

  // 🔓 CLIENTE – LISTADO PÚBLICO
  {
    path: 'explore',
    loadComponent: () =>
      import('./pages/restaurants-explore.component')
        .then(m => m.RestaurantsExploreComponent),
  },

  // 🔓 CLIENTE – DETALLE DEL RESTAURANTE
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/restaurant-detail.component')
        .then(m => m.RestaurantDetailComponent),
  },
];
