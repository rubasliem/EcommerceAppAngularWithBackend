import { importProvidersFrom, mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { BrowserAnimationsModule, provideAnimations } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app.config';

export const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    provideHttpClient(withFetch()),
    provideRouter(routes),
    importProvidersFrom(
      BrowserAnimationsModule,
      ToastrModule.forRoot({
        positionClass: 'toast-bottom-right',
        timeOut: 3000,
        preventDuplicates: true,
        closeButton: true
      })
    ),
    provideAnimations()
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
