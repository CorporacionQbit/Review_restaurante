import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../features/auth/auth.service';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    const role = auth.getUserRole();

    // 🔒 No hay rol → no autenticado
    if (!role) {
      router.navigate(['/auth/login']);
      return false;
    }

    // 🚫 Rol no permitido
    if (!allowedRoles.includes(role)) {
      router.navigate(['/restaurants']);
      return false;
    }

    return true;
  };
};
