import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [

  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login.component')
        .then(m => m.LoginComponent),
  },

  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register.component')
        .then(m => m.RegisterComponent),
  },
  
    {
    path: 'forgot-password',
    loadComponent: () =>
      import('./pages/forgot-password.component').then(
        m => m.ForgotPasswordComponent
      ),
  },
  {
  path: 'google-success',
  loadComponent: () =>
    import('./pages/google-success.component')
      .then(m => m.GoogleSuccessComponent),
},


  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];
