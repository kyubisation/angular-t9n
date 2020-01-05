import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Params } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { map, share, switchMap } from 'rxjs/operators';

import { TranslationTargetUnitResponse } from '../../../models';
import { TranslationTargetService } from '../core/translation-target.service';
import { xlfElementValidator } from '../core/xlf-element-validator';

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
    private _formBuilder: FormBuilder,
    private _snackbar: MatSnackBar
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

  copySourceToClipboard(source: string) {
    if (!document) {
      return;
    }

    const textarea = document.createElement('textarea');
    textarea.classList.add('cdk-visually-hidden');
    textarea.value = source;
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    try {
      if (document.execCommand('copy')) {
        this._snackbar.open('Copied source to clipboard', undefined, { duration: 2500 });
        return;
      } else {
        throw new Error();
      }
    } catch {
      this._snackbar.open('Failed to copy source to clipboard', undefined, { duration: 2500 });
    }

    document.body.removeChild(textarea);
  }

  private _createForm(unit: TranslationTargetUnitResponse) {
    const form = this._formBuilder.group({
      description: [{ value: unit.description || '-', disabled: true }],
      meaning: [{ value: unit.meaning || '-', disabled: true }],
      source: [{ value: unit.source, disabled: true }],
      target: [unit.target, xlfElementValidator(unit.source)],
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
