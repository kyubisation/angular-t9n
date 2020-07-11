import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';

import { ExportComponent } from './export/export.component';
import { ImportComponent } from './import/import.component';
import { OrphanComponent } from './orphan/orphan.component';
import { OrphansComponent } from './orphans/orphans.component';
import { TargetRoutingModule } from './target-routing.module';
import { TargetComponent } from './target/target.component';
import { TranslateComponent } from './translate/translate.component';
import { UnitComponent } from './unit/unit.component';

@NgModule({
  declarations: [
    TranslateComponent,
    ExportComponent,
    ImportComponent,
    TargetComponent,
    OrphansComponent,
    UnitComponent,
    OrphanComponent,
  ],
  imports: [SharedModule, TargetRoutingModule],
})
export class TargetModule {}
