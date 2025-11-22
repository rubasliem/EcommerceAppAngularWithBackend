import { mergeApplicationConfig, ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app.config';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),provideHttpClient(withFetch()),
    provideRouter(routes),
        provideAnimations(),
        provideToastr({
          positionClass: 'toast-bottom-right',
          timeOut: 1500,
          progressBar: true,
          closeButton: true
          })
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
