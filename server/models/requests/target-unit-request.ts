import { IsIn, IsString } from 'class-validator';

import { TranslationTargetUnit } from '../translation-target-unit';

export class TargetUnitRequest implements Partial<TranslationTargetUnit> {
  @IsString()
  target!: string;
  @IsIn(['initial', 'translated', 'reviewed', 'final'])
  state!: 'initial' | 'translated' | 'reviewed' | 'final';
}
