import { basename, extname, join, Path } from '@angular-devkit/core';

import { TranslationTarget } from '../models';

export class TargetPathBuilder {
  private readonly _basename: string;
  private readonly _extension: string;

  constructor(private readonly _targetDirectory: Path, sourceFile: Path) {
    this._extension = extname(sourceFile);
    const sourceFileBasename = basename(sourceFile);
    this._basename = sourceFileBasename.substring(
      0,
      sourceFileBasename.length - this._extension.length
    );
  }

  createPath(target: TranslationTarget) {
    return join(this._targetDirectory, `${this._basename}.${target.language}${this._extension}`);
  }
}
