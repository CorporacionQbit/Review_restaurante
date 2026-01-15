import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';
export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard, roleGuard(['admin'])],
    loadComponent: () =>
      import('./pages/admin-dashboard.component')
        .then(m => m.AdminDashboardComponent),
  },
  {
    path: 'reviews-reports',
    loadComponent: () =>
      import('./pages/review/admin-review-reports.component')
        .then(m => m.AdminReviewReportsComponent),
  },
  {
    path: 'reviews-pending',
    loadComponent: () =>
      import('./pages/review/pendientes reviews/admin-pending-reviews.component')
        .then(m => m.AdminPendingReviewsComponent),
  },
  {
    path: 'categories',
    loadComponent: () =>
      import('./pages/categories/categories.component')
        .then(m => m.CategoriesPageComponent),
  },
  {
  path: 'restaurants-approval',
  canActivate: [authGuard, roleGuard(['admin'])],
  loadComponent: () =>
    import('./pages/aprobacion/restaurants-approval.component')
      .then(m => m.RestaurantsApprovalComponent),
},
{
  path: 'restaurants-history',
  loadComponent: () =>
    import('./pages/Historial-restaurante/restaurants-history.component')
      .then(m => m.RestaurantsHistoryComponent),
},
{
  path: 'admin-owners',
  canActivate: [authGuard, roleGuard(['admin'])],
  loadComponent: () =>
    import('./pages/vista-duenos/admin-owners.component')
      .then(m => m.AdminOwnersComponent),
},

{
  path: 'admin-users',
  canActivate: [authGuard, roleGuard(['admin'])],
  loadComponent: () =>
    import('./pages/Usuarios/admin-users.component')
      .then(m => m.AdminUsersComponent),
}

];
