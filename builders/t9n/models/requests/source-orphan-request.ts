import { IsString } from 'class-validator';

import { TranslationSourceUnit } from '../translation-source-unit';

export class SourceOrphanRequest implements Partial<TranslationSourceUnit> {
  @IsString()
  id!: string;
}
