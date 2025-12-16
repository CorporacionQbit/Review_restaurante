import { Routes } from '@angular/router';
import { LayoutComponent } from './shared/components/layout/layout.component';

export const routes: Routes = [

  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },

  // AUTH
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes')
        .then(m => m.AUTH_ROUTES),
  },

  // APP INTERNA CON LAYOUT
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

    ],
  },

  {
    path: '**',
    redirectTo: 'auth/login',
  },
];
