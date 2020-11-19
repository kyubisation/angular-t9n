export interface AngularJsonI18n {
  sourceLocale?: string | { code: string; baseHref: string };
  locales?: {
    [locale: string]: AngularJsonI18nLocale;
  };
}

export type AngularJsonI18nLocale =
  | string
  | string[]
  | { translation: string | string[]; baseHref?: string };
