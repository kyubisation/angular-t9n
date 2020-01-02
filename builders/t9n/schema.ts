export interface Schema {
  i18nFormat: 'xlf' | 'xlf2';
  translationFile: string;
  targetTranslationPath: string;
  includeContextInTarget: boolean;
  port: number;
}
