import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { NZ_I18N, es_ES } from 'ng-zorro-antd/i18n';

import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

// ✅ SOLO ESTO
import { provideEcharts } from 'ngx-echarts';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([
        authInterceptor,
        errorInterceptor,
      ])
    ),
    provideAnimations(),

    { provide: NZ_I18N, useValue: es_ES },

    // 🔥 ASÍ ES CORRECTO EN ngx-echarts v18
    provideEcharts(),
  ],
};
