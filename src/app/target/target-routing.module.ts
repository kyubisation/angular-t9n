import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ExportComponent } from './export/export.component';
import { ImportComponent } from './import/import.component';
import { OrphansComponent } from './orphans/orphans.component';
import { TargetComponent } from './target/target.component';
import { TranslateComponent } from './translate/translate.component';

const routes: Routes = [
  {
    path: 'target/:language',
    component: TargetComponent,
    children: [
      {
        path: '',
        component: TranslateComponent
      },
      {
        path: 'import',
        component: ImportComponent
      },
      {
        path: 'export',
        component: ExportComponent
      },
      {
        path: 'orphans',
        component: OrphansComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TargetRoutingModule {}
