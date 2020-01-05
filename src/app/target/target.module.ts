import { TextFieldModule } from '@angular/cdk/text-field';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

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
    OrphanComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSidenavModule,
    MatSortModule,
    MatTableModule,
    MatTooltipModule,
    TextFieldModule,
    TargetRoutingModule
  ]
})
export class TargetModule {}
