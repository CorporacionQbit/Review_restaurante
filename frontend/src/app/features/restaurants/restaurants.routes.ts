import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';

export const RESTAURANTS_ROUTES: Routes = [

  // 🔒 OWNER – LISTADO
  {
    path: '',
    canActivate: [authGuard, roleGuard(['owner'])],
    loadComponent: () =>
      import('./pages/restaurants-owner.component')
        .then(m => m.RestaurantsOwnerComponent),
  },

  // 🔒 OWNER – CREAR
  {
    path: 'create',
    canActivate: [authGuard, roleGuard(['owner'])],
    loadComponent: () =>
      import('./pages/create-restaurant.component')
        .then(m => m.CreateRestaurantComponent),
  },

  // 🔒 OWNER – DASHBOARD
  {
    path: ':id/dashboard',
    canActivate: [authGuard, roleGuard(['owner'])],
    loadComponent: () =>
      import('./dashboard/restaurant-dashboard-component')
        .then(m => m.RestaurantDashboardComponent),
  },

  // 🔒 OWNER – IMÁGENES
  {
    path: ':id/images',
    canActivate: [authGuard, roleGuard(['owner'])],
    loadComponent: () =>
      import('./pages/restaurant-images.component')
        .then(m => m.RestaurantImagesComponent),
  },

  // 🔒 OWNER – MAPA
  {
    path: ':id/map',
    canActivate: [authGuard, roleGuard(['owner'])],
    loadComponent: () =>
      import('./pages/map/restaurant-map.component')
        .then(m => m.RestaurantMapComponent),
  },

  // 🔒 OWNER – POSTS
  {
    path: ':id/posts',
    canActivate: [authGuard, roleGuard(['owner'])],
    loadComponent: () =>
      import('./pages/post/restaurant-post.component')
        .then(m => m.RestaurantPostsComponent),
  },

  // ⭐ OWNER – MENÚ (PREMIUM)
  {
    path: ':id/menu',
    canActivate: [authGuard, roleGuard(['owner'])],
    loadComponent: () =>
      import('./pages/menu/restaurant-menu.component')
        .then(m => m.RestaurantMenuComponent),
  },

  // 💳 OWNER – SUSCRIPCIÓN
  {
    path: ':id/subscription',
    canActivate: [authGuard, roleGuard(['owner'])],
    loadComponent: () =>
      import('./pages/subscription/subscription.component')
        .then(m => m.SubscriptionComponent),
  },
];
