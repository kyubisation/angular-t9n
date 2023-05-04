import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'orphans',
    loadComponent: () =>
      import('./source-orphans/source-orphans.component').then((m) => m.SourceOrphansComponent),
    children: [
      {
        path: '',
        redirectTo: 'migrate',
        pathMatch: 'full',
      },
      {
        path: 'migrate',
        loadComponent: () => import('./migrate/migrate.component').then((m) => m.MigrateComponent),
      },
      {
        path: 'migrate/:orphanId',
        loadComponent: () =>
          import('./source-orphan/source-orphan.component').then((m) => m.SourceOrphanComponent),
      },
      {
        path: 'auto-migration',
        loadComponent: () =>
          import('./auto-migrate/auto-migrate.component').then((m) => m.AutoMigrateComponent),
      },
    ],
  },
];
