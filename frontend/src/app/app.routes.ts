import { Routes } from '@angular/router';
import { LayoutComponent } from './shared/components/layout/layout.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [

  // 🏠 HOME PÚBLICO
{
  path: '',
  redirectTo: 'restaurants/explore',
  pathMatch: 'full',
},

  // 🔐 AUTH
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes')
        .then(m => m.AUTH_ROUTES),
  },

  // 🔒 APP INTERNA (PROTEGIDA)
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

  // 🚫 404 → HOME
  {
    path: '**',
    redirectTo: '',
  },
];
