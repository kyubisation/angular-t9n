import { basename, extname, join } from 'path';

import { TranslationTarget } from '../models';

export class TargetPathBuilder {
  private readonly _basename: string;
  private readonly _extension: string;

  constructor(
    private readonly _targetDirectory: string,
    sourceFile: string,
  ) {
    this._extension = extname(sourceFile);
    const sourceFileBasename = basename(sourceFile);
    this._basename = sourceFileBasename.substring(
      0,
      sourceFileBasename.length - this._extension.length,
    );
  }

  createPath(target: TranslationTarget | string) {
    const language = typeof target === 'string' ? target : target.language;
    return join(this._targetDirectory, `${this._basename}.${language}${this._extension}`);
  }
}
