import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AutoMigrateComponent } from './auto-migrate/auto-migrate.component';
import { MigrateComponent } from './migrate/migrate.component';
import { SourceOrphanComponent } from './source-orphan/source-orphan.component';
import { SourceOrphansComponent } from './source-orphans/source-orphans.component';

const routes: Routes = [
  {
    path: 'orphans',
    component: SourceOrphansComponent,
    children: [
      {
        path: '',
        redirectTo: 'migrate',
        pathMatch: 'full',
      },
      {
        path: 'migrate',
        component: MigrateComponent,
      },
      {
        path: 'migrate/:orphanId',
        component: SourceOrphanComponent,
      },
      {
        path: 'auto-migration',
        component: AutoMigrateComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SourceOrphansRoutingModule {}
