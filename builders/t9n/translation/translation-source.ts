import { TranslationSourceUnit } from './translation-source-unit';

export class TranslationSource {
  readonly units: TranslationSourceUnit[];

  constructor(
    readonly file: string,
    readonly language: string,
    readonly unitMap: Map<string, TranslationSourceUnit>
  ) {
    this.units = Array.from(this.unitMap.values());
  }
}
