import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./overview/overview.component').then((m) => m.OverviewComponent),
  },
];
