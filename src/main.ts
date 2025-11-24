import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { importProvidersFrom } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule, provideToastr } from 'ngx-toastr';

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(HttpClientModule),
    importProvidersFrom(BrowserAnimationsModule),
    importProvidersFrom(ToastrModule.forRoot()), // 👈 تسجيل ToastrModule
    provideRouter(routes),
    provideToastr(), // 👈 توفير ToastrService و ToastConfig
  ]
}).catch(err => console.error(err));
