import { provideZoneChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Routes } from '@angular/router';

import { AppComponent } from './app/app.component';
import { routes as overviewRoutes } from './app/overview/overview-routing';
import { routes as sourceOrphanRoutes } from './app/source-orphans/source-orphans-routing';
import { routes as targetRoutes } from './app/target/target-routing';

const routes: Routes = [...overviewRoutes, ...sourceOrphanRoutes, ...targetRoutes];

bootstrapApplication(AppComponent, {
  providers: [provideZoneChangeDetection(), provideRouter(routes)],
}).catch((err) => console.error(err));
