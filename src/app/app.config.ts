import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { HttpClientModule } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { es } from 'date-fns/locale';




export const appConfig: ApplicationConfig = {
  providers: [

    
    provideRouter([]),
    importProvidersFrom(
      HttpClientModule,
      
      ),
      provideNativeDateAdapter(), // Adaptador de fecha nativo
    { provide: MAT_DATE_LOCALE, useValue: es },
    provideAnimations(),
    providePrimeNG({
            theme: {
                preset: Aura
            }
        })

  ]
  
};
