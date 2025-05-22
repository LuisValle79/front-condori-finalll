// 👇 Esto corrige el error "global is not defined"
import { Buffer } from 'buffer';

(window as any).global = window;
(window as any).process = { env: { DEBUG: undefined } };
(window as any).Buffer = Buffer;



import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter } from '@angular/router'; // ✅ Importar provider del router
import { routes } from './app/app.routes'; // ✅ Archivo con tus rutas
import { MatSidenavModule } from '@angular/material/sidenav';
import { importProvidersFrom } from '@angular/core';
import { provideToastr } from 'ngx-toastr';
import { provideAnimations, provideNoopAnimations } from '@angular/platform-browser/animations';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withFetch()), // Activa el uso de fetch para HttpClient
    provideRouter(routes), // ✅ Proporciona las rutas para activar ActivatedRoute
    importProvidersFrom(MatSidenavModule),
    provideAnimations(),
    provideToastr({
      timeOut: 3000,
      positionClass: 'toast-bottom-right',
      preventDuplicates: true,
    }),// ✅ Proporciona el módulo MatSidenavModule
  ]
}).catch((err) => console.error(err));
