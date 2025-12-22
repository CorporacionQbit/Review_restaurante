import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    canActivate: [
      authGuard,
      roleGuard(['admin']),
    ],
    loadComponent: () =>
      import('./pages/admin-dashboard.component')
        .then(m => m.AdminDashboardComponent),
  },
];
