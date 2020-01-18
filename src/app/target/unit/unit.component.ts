import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { map, share, switchMap } from 'rxjs/operators';

import { TranslationTargetUnitResponse } from '../../../models';
import { TranslationTargetService } from '../core/translation-target.service';

@Component({
  selector: 't9n-unit',
  templateUrl: './unit.component.html',
  styleUrls: ['./unit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UnitComponent implements OnDestroy {
  unit: Observable<TranslationTargetUnitResponse>;
  params: Observable<Params>;
  form: Observable<FormGroup>;
  private _destroy = new Subject<void>();

  constructor(
    private _translationTargetService: TranslationTargetService,
    private _route: ActivatedRoute,
    private _formBuilder: FormBuilder
  ) {
    this.params = this._route.params.pipe(map(({ unitId, ...params }) => params));
    this.unit = this._route.paramMap.pipe(
      switchMap(p => this._translationTargetService.unit(p.get('unitId')!)),
      share()
    );
    this.form = this.unit.pipe(map(u => this._createForm(u)));
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
      state: [{ value: unit.state, disabled: !unit.target }]
    });
    this._translationTargetService.updateUnitOnChange(
      unit,
      form.controls as { target: AbstractControl; state: AbstractControl },
      this._destroy
    );
    form.controls.target.markAsTouched();
    return form;
  }
}
