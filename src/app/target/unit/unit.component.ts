import { TextFieldModule } from '@angular/cdk/text-field';
import { NgIf, AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import {
  AbstractControl,
  UntypedFormBuilder,
  UntypedFormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Params, RouterLink } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { map, share, switchMap } from 'rxjs/operators';

import { TranslationTargetUnitResponse } from '../../../models';
import { TranslationTargetService } from '../core/translation-target.service';

@Component({
  selector: 't9n-unit',
  templateUrl: './unit.component.html',
  styleUrls: ['./unit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgIf,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    TextFieldModule,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    MatSelectModule,
    MatOptionModule,
    RouterLink,
    AsyncPipe,
  ],
})
export class UnitComponent implements OnDestroy {
  unit: Observable<TranslationTargetUnitResponse>;
  params: Observable<Params>;
  form: Observable<UntypedFormGroup>;
  private _destroy = new Subject<void>();

  constructor(
    private _translationTargetService: TranslationTargetService,
    private _route: ActivatedRoute,
    private _formBuilder: UntypedFormBuilder,
  ) {
    this.params = this._route.params.pipe(map(({ unitId, ...params }) => params));
    this.unit = this._route.paramMap.pipe(
      switchMap((p) => this._translationTargetService.unit(p.get('unitId')!)),
      share(),
    );
    this.form = this.unit.pipe(map((u) => this._createForm(u)));
  }

  ngOnDestroy(): void {
    this._destroy.next();
    this._destroy.complete();
  }

  private _createForm(unit: TranslationTargetUnitResponse) {
    const form = this._formBuilder.group({
      description: [{ value: unit.description || '-', disabled: true }],
      meaning: [{ value: unit.meaning || '-', disabled: true }],
      source: [{ value: unit.source, disabled: true }],
      target: unit.target,
      state: unit.state,
    });
    this._translationTargetService.updateUnitOnChange(
      unit,
      form.controls as { target: AbstractControl; state: AbstractControl },
      this._destroy,
    );
    form.controls.target.markAsTouched();
    return form;
  }
}
