import { normalize, Path, relative, workspaces } from '@angular-devkit/core';

import {
  TargetPathBuilder,
  TranslationSource,
  TranslationTarget,
  TranslationTargetRegistry,
} from '../../../server';

import {
  AngularJsonI18n,
  AngularJsonI18nLocale,
  AngularJsonI18nLocaleMultipleTranslationsObject,
  AngularJsonI18nLocaleObject,
  AngularJsonI18nSourceLocaleObject,
} from './angular-json-i18n';

export class AngularI18n {
  constructor(
    private _host: workspaces.WorkspaceHost,
    private _workspaceRoot: Path,
    private _projectName: string,
    private _targetPathBuilder: TargetPathBuilder,
    private _translationContextFactory: () => {
      source: TranslationSource;
      targetRegistry: TranslationTargetRegistry;
    },
  ) {}

  async sourceLocale(): Promise<AngularJsonI18nSourceLocaleObject> {
    const i18n = await this._readProjectI18n();
    return typeof i18n.sourceLocale === 'object'
      ? i18n.sourceLocale
      : { code: i18n.sourceLocale || '' };
  }

  async locales(): Promise<{ [locale: string]: AngularJsonI18nLocaleMultipleTranslationsObject }> {
    const i18n = await this._readProjectI18n();
    const locales = i18n.locales || {};
    return Object.keys(locales)
      .sort()
      .reduce(
        (current, next) =>
          Object.assign(current, {
            [next]: this._normalizeI18nLocale(locales[next]),
          }),
        {} as { [locale: string]: AngularJsonI18nLocaleMultipleTranslationsObject },
      );
  }

  async update(): Promise<void> {
    const { source, targetRegistry } = this._translationContextFactory();
    const i18n = await this._readProjectI18n();
    if (typeof i18n.sourceLocale === 'object' || source.baseHref || source.subPath) {
      const sourceLocale: AngularJsonI18nSourceLocaleObject = { code: source.language };
      if (source.baseHref) {
        sourceLocale.baseHref = source.baseHref;
      } else if (typeof i18n.sourceLocale === 'object' && i18n.sourceLocale.baseHref) {
        sourceLocale.baseHref = i18n.sourceLocale.baseHref;
      }
      if (source.subPath) {
        sourceLocale.subPath = source.subPath;
      } else if (typeof i18n.sourceLocale === 'object' && i18n.sourceLocale.subPath) {
        sourceLocale.subPath = i18n.sourceLocale.subPath;
      }
      i18n.sourceLocale = sourceLocale;
    } else {
      i18n.sourceLocale = source.language;
    }

    const locales = i18n.locales ?? {};
    i18n.locales = targetRegistry
      .values()
      .sort((a, b) => a.language.localeCompare(b.language))
      .reduce(
        (current, next) =>
          Object.assign(current, {
            [next.language]: this._i18nLocale(next, locales[next.language]),
          }),
        {},
      );

    const { project, workspace } = await this._readProject();
    // Cheap deep equal comparison
    if (JSON.stringify(project.extensions.i18n) !== JSON.stringify(i18n)) {
      project.extensions.i18n = i18n as any;
      await workspaces.writeWorkspace(workspace, this._host);
    }
  }

  projectRelativePath(target: TranslationTarget) {
    return relative(this._workspaceRoot, normalize(this._targetPathBuilder.createPath(target)));
  }

  private async _readProjectI18n(): Promise<AngularJsonI18n> {
    const { project } = await this._readProject();
    return (project.extensions.i18n as any) || {};
  }

  private async _readProject() {
    const { workspace } = await workspaces.readWorkspace(this._workspaceRoot, this._host);
    const project = workspace.projects.get(this._projectName)!;
    return { workspace, project };
  }

  private _i18nLocale(
    target: TranslationTarget,
    locale: AngularJsonI18nLocale | undefined,
  ): AngularJsonI18nLocale {
    const translationPath = this.projectRelativePath(target);
    const normalizedLocale = locale ? this._normalizeI18nLocale(locale) : { translation: [] };
    if (!normalizedLocale.translation.includes(translationPath)) {
      normalizedLocale.translation.push(translationPath);
    }

    const translation =
      normalizedLocale.translation.length === 1
        ? normalizedLocale.translation[0]
        : normalizedLocale.translation;
    if (
      (!target.baseHref || target.baseHref === target.language) &&
      (!target.subPath || target.subPath === target.language)
    ) {
      return translation;
    }
    const result: AngularJsonI18nLocaleObject = { translation };
    if (target.baseHref && target.baseHref !== target.language) {
      result.baseHref = target.baseHref;
    }
    if (target.subPath && target.subPath !== target.language) {
      result.subPath = target.subPath;
    }

    return result;
  }

  private _normalizeI18nLocale(
    locale: AngularJsonI18nLocale,
  ): AngularJsonI18nLocaleMultipleTranslationsObject {
    if (typeof locale === 'string') {
      return { translation: [locale] };
    } else if (Array.isArray(locale)) {
      return { translation: locale };
    } else if (!Array.isArray(locale.translation)) {
      return { ...locale, translation: [locale.translation] };
    } else {
      return locale as AngularJsonI18nLocaleMultipleTranslationsObject;
    }
  }
}
