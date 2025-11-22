import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { importProvidersFrom } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { BrowserAnimationsModule, provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr} from 'ngx-toastr';

bootstrapApplication(AppComponent, {
  providers: [
  importProvidersFrom(HttpClientModule, BrowserAnimationsModule),
    provideRouter(routes),
    provideAnimations(),
    provideToastr({
      positionClass: 'toast-bottom-right',
      timeOut: 1500,
      progressBar: true,
      closeButton: true
    })
  ]
}).catch(err => console.error(err));