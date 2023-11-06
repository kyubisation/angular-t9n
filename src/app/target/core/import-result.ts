import { TranslationTargetUnitResponse } from '../../../models';

export class ImportResult {
  readonly failedFiles: string[] = [];
  readonly failedUnits: Partial<TranslationTargetUnitResponse>[] = [];
  readonly importedUnits: TranslationTargetUnitResponse[] = [];

  sort() {
    this.failedFiles.sort();
    const unitSorter = (
      a: Partial<TranslationTargetUnitResponse>,
      b: Partial<TranslationTargetUnitResponse>,
    ) => a.id!.localeCompare(b.id!);
    this.failedUnits.sort(unitSorter);
    this.importedUnits.sort(unitSorter);

    return this;
  }
}
