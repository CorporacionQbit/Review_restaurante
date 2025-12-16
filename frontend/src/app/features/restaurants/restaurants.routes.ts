import { Routes } from '@angular/router';

export const RESTAURANTS_ROUTES: Routes = [

  // OWNER
  {
    path: '',
    loadComponent: () =>
      import('./pages/restaurants-owner.component')
        .then(m => m.RestaurantsOwnerComponent),
  },

  // CLIENTE
  {
    path: 'explore',
    loadComponent: () =>
      import('./pages/restaurants-explore.component')
        .then(m => m.RestaurantsExploreComponent),
  },
];
