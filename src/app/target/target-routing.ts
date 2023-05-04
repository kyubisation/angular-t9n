import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'target/:language',
    loadComponent: () => import('./target/target.component').then((m) => m.TargetComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./translate/translate.component').then((m) => m.TranslateComponent),
      },
      {
        path: 'unit/:unitId',
        loadComponent: () => import('./unit/unit.component').then((m) => m.UnitComponent),
      },
      {
        path: 'import',
        loadComponent: () => import('./import/import.component').then((m) => m.ImportComponent),
      },
      {
        path: 'export',
        loadComponent: () => import('./export/export.component').then((m) => m.ExportComponent),
      },
      {
        path: 'orphans',
        loadComponent: () => import('./orphans/orphans.component').then((m) => m.OrphansComponent),
      },
      {
        path: 'orphans/:orphanId',
        loadComponent: () => import('./orphan/orphan.component').then((m) => m.OrphanComponent),
      },
    ],
  },
];
