export interface Schema {
  /** Name of the project to target. */
  project: string;
  translationFile: string;
  targetTranslationPath: string;
  includeContextInTarget: boolean;
  packageScript: boolean;
}
