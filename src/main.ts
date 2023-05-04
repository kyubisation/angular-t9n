import { withInterceptorsFromDi, provideHttpClient } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, Routes } from '@angular/router';

import { AppComponent } from './app/app.component';
import { routes as overviewRoutes } from './app/overview/overview-routing';
import { routes as sourceOrphanRoutes } from './app/source-orphans/source-orphans-routing';
import { routes as targetRoutes } from './app/target/target-routing';

const routes: Routes = [...overviewRoutes, ...sourceOrphanRoutes, ...targetRoutes];

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi()),
    provideRouter(routes),
  ],
}).catch((err) => console.error(err));
