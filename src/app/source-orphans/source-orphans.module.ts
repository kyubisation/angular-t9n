import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';

import { AutoMigrateComponent } from './auto-migrate/auto-migrate.component';
import { MigrateComponent } from './migrate/migrate.component';
import { SourceOrphanComponent } from './source-orphan/source-orphan.component';
import { SourceOrphansRoutingModule } from './source-orphans-routing.module';
import { SourceOrphansComponent } from './source-orphans/source-orphans.component';

@NgModule({
  declarations: [
    SourceOrphansComponent,
    MigrateComponent,
    AutoMigrateComponent,
    SourceOrphanComponent,
  ],
  imports: [SharedModule, SourceOrphansRoutingModule],
})
export class SourceOrphansModule {}
