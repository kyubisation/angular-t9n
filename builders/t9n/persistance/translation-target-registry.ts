import { Injectable } from '@nestjs/common';

import { TranslationTarget } from '../models';

@Injectable()
export class TranslationTargetRegistry {
  private readonly _targets: Map<string, TranslationTarget> = new Map();

  get(key: string): TranslationTarget | undefined {
    return this._targets.get(key);
  }

  has(key: string): boolean {
    return this._targets.has(key);
  }

  set(key: string, value: TranslationTarget): this {
    this._targets.set(key, value);
    return this;
  }

  keys(): string[] {
    return Array.from(this._targets.keys());
  }

  values(): TranslationTarget[] {
    return Array.from(this._targets.values());
  }
}
