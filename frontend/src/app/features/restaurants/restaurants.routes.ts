import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';

export const RESTAURANTS_ROUTES: Routes = [

  // 🔒 OWNER – LISTADO DE RESTAURANTES
  {
    path: '',
    canActivate: [authGuard, roleGuard(['owner'])],
    loadComponent: () =>
      import('./pages/restaurants-owner.component')
        .then(m => m.RestaurantsOwnerComponent),
  },

  // 🔒 OWNER – CREAR RESTAURANTE
  {
    path: 'create',
    canActivate: [authGuard, roleGuard(['owner'])],
    loadComponent: () =>
      import('./pages/create-restaurant.component')
        .then(m => m.CreateRestaurantComponent),
  },

  // 🔒 OWNER – DASHBOARD (🔥 ANTES DE :id)
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

{
  path: ':id/menu',
  canActivate: [authGuard, roleGuard(['owner'])],
  loadComponent: () =>
    import('./pages/menu/restaurant-menu.component')
      .then(m => m.RestaurantMenuComponent),
},

  // 🔓 CLIENTE – EXPLORAR
  {
    path: 'explore',
    loadComponent: () =>
      import('./pages/restaurants-explore.component')
        .then(m => m.RestaurantsExploreComponent),
  },

  // 🔓 CLIENTE – DETALLE PÚBLICO (⚠️ SIEMPRE AL FINAL)
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/restaurant-detail.component')
        .then(m => m.RestaurantDetailComponent),
  },
  // 🔒 OWNER – MENÚ


];
