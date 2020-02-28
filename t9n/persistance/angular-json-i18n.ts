export interface AngularJsonI18n {
  sourceLocale?: string | { code: string; baseHref: string };
  locales?: {
    [locale: string]: string | { translation: string; baseHref: string };
  };
}
