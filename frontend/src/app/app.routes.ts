import { Routes, UrlSegment } from '@angular/router';
import { LayoutComponent } from './shared/components/layout/layout.component';

/* 🔓 matcher SOLO numérico */
export function numericIdMatcher(segments: UrlSegment[]) {
  if (
    segments.length === 2 &&
    segments[0].path === 'restaurants' &&
    /^[0-9]+$/.test(segments[1].path)
  ) {
    return {
      consumed: segments,
      posParams: {
        id: segments[1],
      },
    };
  }
  return null;
}

export const routes: Routes = [

  // =========================
  // HOME
  // =========================
  {
    path: '',
    redirectTo: 'restaurants/explore',
    pathMatch: 'full',
  },

  // =========================
  // 🔓 EXPLORAR (PÚBLICO)
  // =========================
  {
    path: 'restaurants/explore',
    loadComponent: () =>
      import('./features/restaurants/pages/restaurants-explore.component')
        .then(m => m.RestaurantsExploreComponent),
  },

  // =========================
  // 🔓 DETALLE PÚBLICO (⚠️ DEBE IR AQUÍ)
  // =========================
  {
    matcher: numericIdMatcher,
    loadComponent: () =>
      import('./features/restaurants/pages/restaurant-detail.component')
        .then(m => m.RestaurantDetailComponent),
  },

  // =========================
  // 🔐 AUTH
  // =========================
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes')
        .then(m => m.AUTH_ROUTES),
  },

  // =========================
  // 🔒 ÁREA PRIVADA (LAYOUT)
  // =========================
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
        path: 'analytics',
        loadChildren: () =>
          import('./features/analytics/services/analytics.routes')
            .then(m => m.ANALYTICS_ROUTES),
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

  // =========================
  // 404
  // =========================
  {
    path: '**',
    redirectTo: '',
  },
];
