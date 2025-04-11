export interface AngularJsonI18nSourceLocaleObject {
  code: string;
  baseHref?: string;
  subPath?: string;
}

export interface AngularJsonI18n {
  sourceLocale?: string | AngularJsonI18nSourceLocaleObject;
  locales?: {
    [locale: string]: AngularJsonI18nLocale;
  };
}

export interface AngularJsonI18nLocaleObject {
  translation: string | string[];
  baseHref?: string;
  subPath?: string;
}

export interface AngularJsonI18nLocaleSingleTranslationObject {
  translation: string;
  baseHref?: string;
  subPath?: string;
}

export interface AngularJsonI18nLocaleMultipleTranslationsObject {
  translation: string[];
  baseHref?: string;
  subPath?: string;
}

export type AngularJsonI18nLocale = string | string[] | AngularJsonI18nLocaleObject;
