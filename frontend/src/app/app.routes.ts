import { Routes } from '@angular/router';
import { LayoutComponent } from './shared/components/layout/layout.component';

export const routes: Routes = [

  // HOME
  {
    path: '',
    redirectTo: 'restaurants/explore',
    pathMatch: 'full',
  },

  // 🔓 EXPLORAR (PUBLICO)
  {
    path: 'restaurants/explore',
    loadComponent: () =>
      import('./features/restaurants/pages/restaurants-explore.component')
        .then(m => m.RestaurantsExploreComponent),
  },

  // 🔓 DETALLE PUBLICO (⭐ CLAVE)
  {
    path: 'restaurants/:id',
    loadComponent: () =>
      import('./features/restaurants/pages/restaurant-detail.component')
        .then(m => m.RestaurantDetailComponent),
  },

  // 🔐 AUTH
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes')
        .then(m => m.AUTH_ROUTES),
  },

  // 🔒 AREA PRIVADA (CON LAYOUT)
  {
    path: '',
    component: LayoutComponent,
    children: [

      {
        path: 'restaurants',
        loadChildren: () =>
          import('./features/restaurants/restaurants.routes')
            .then(m => m.RESTAURANTS_ROUTES),
      },

      {
        path: 'admin',
        loadChildren: () =>
          import('./features/admin/admin.routes')
            .then(m => m.ADMIN_ROUTES),
      },

      {
        path: 'profile',
        loadChildren: () =>
          import('./features/profile/profile.routes')
            .then(m => m.PROFILE_ROUTES),
      },

      {
        path: 'favorites',
        loadChildren: () =>
          import('./features/favorites/favorite.routes')
            .then(m => m.FAVORITES_ROUTES),
      },
    ],
  },

  // 404
  {
    path: '**',
    redirectTo: '',
  },
];
