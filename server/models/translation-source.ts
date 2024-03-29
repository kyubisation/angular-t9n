import { TranslationSourceUnit } from './translation-source-unit';

export class TranslationSource {
  readonly units: TranslationSourceUnit[];
  baseHref?: string;

  constructor(
    readonly language: string,
    readonly unitMap: Map<string, TranslationSourceUnit>,
  ) {
    this.units = Array.from(this.unitMap.values());
  }
}
