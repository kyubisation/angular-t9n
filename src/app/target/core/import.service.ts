import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { switchMap } from 'rxjs/operators';

import { TranslationTargetUnitResponse } from '../../../models';

import { ImportResult } from './import-result';
import { TranslationTargetService } from './translation-target.service';

@Injectable()
export class ImportService {
  constructor(private _translationTargetService: TranslationTargetService) {}

  async import(files: FileList, state: 'translated' | 'reviewed' | 'final') {
    const { read, utils } = await import('xlsx');
    const result = new ImportResult();
    const unitRows = await Promise.all(
      Array.from(files).map(async f => {
        try {
          const binary = await this._readFileAsBinary(f);
          const workbook = read(binary, { type: 'binary' });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const rows = utils
            .sheet_to_json<string[]>(sheet, { header: 1 })
            .slice(1)
            .map(row => this._toPartialTargetUnit(row))
            .filter(u => u.id && u.target);
          if (!rows.length) {
            throw new Error(`${f.name} contains no valid units`);
          }

          return rows;
        } catch (e) {
          console.log(e);
          result.failedFiles.push(f.name);
          return [] as Partial<TranslationTargetUnitResponse>[];
        }
      })
    );
    await Promise.all(
      unitRows
        .reduce((current, next) => current.concat(next), [])
        .map(async u => {
          try {
            const response = await this._importUnit(u, state).toPromise();
            result.importedUnits.push(response);
          } catch {
            result.failedUnits.push(u);
          }
        })
    );
    return result.sort();
  }

  private _readFileAsBinary(file: File) {
    return new Promise<any>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => {
        const bytes = new Uint8Array(event.target!.result as ArrayBuffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }

        resolve(binary);
      };
      reader.onerror = (event: ProgressEvent<FileReader>) => reject(event.target!.error);
      reader.onabort = () => reject();
      reader.readAsArrayBuffer(file);
    });
  }

  private _toPartialTargetUnit([id, description, meaning, source, target]: string[]): Partial<
    TranslationTargetUnitResponse
  > {
    return {
      id,
      description,
      meaning,
      source,
      target
    };
  }

  private _importUnit(
    unit: Partial<TranslationTargetUnitResponse>,
    state: 'translated' | 'reviewed' | 'final'
  ) {
    return this._translationTargetService
      .unit(unit.id!)
      .pipe(switchMap(u => this._translationTargetService.updateUnit({ ...u, state })));
  }
}
