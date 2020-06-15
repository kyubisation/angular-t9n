import { Path, relative, workspaces } from '@angular-devkit/core';

import { TranslationSource, TranslationTarget } from '../models';

import { AngularJsonI18n } from './angular-json-i18n';
import { TargetPathBuilder } from './target-path-builder';

export class AngularI18n {
  constructor(
    private _host: workspaces.WorkspaceHost,
    private _workspaceRoot: Path,
    private _projectName: string,
    private _targetPathBuilder: TargetPathBuilder
  ) {}

  async sourceLocale(): Promise<{ code: string; baseHref?: string }> {
    const i18n = await this._readProjectI18n();
    return typeof i18n.sourceLocale === 'object'
      ? i18n.sourceLocale
      : { code: i18n.sourceLocale || '' };
  }

  async locales(): Promise<{ [locale: string]: { translation: string; baseHref?: string } }> {
    const i18n = await this._readProjectI18n();
    const locales = i18n.locales || {};
    return Object.keys(locales)
      .sort()
      .reduce(
        (current, next) =>
          Object.assign(current, {
            [next]:
              typeof locales[next] === 'object' ? locales[next] : { translation: locales[next] },
          }),
        {} as { [locale: string]: { translation: string; baseHref?: string } }
      );
  }

  async update(source: TranslationSource, targets: TranslationTarget[]) {
    const i18n = await this._readProjectI18n();
    if (typeof i18n.sourceLocale === 'object' || source.baseHref) {
      i18n.sourceLocale = {
        code: source.language,
        baseHref:
          source.baseHref ||
          (typeof i18n.sourceLocale === 'object' ? i18n.sourceLocale.baseHref : ''),
      };
    } else {
      i18n.sourceLocale = source.language;
    }

    i18n.locales = targets
      .sort((a, b) => a.language.localeCompare(b.language))
      .reduce(
        (current, next) => Object.assign(current, { [next.language]: this._i18nLocale(next) }),
        {}
      );

    const { project, workspace } = await this._readProject();
    // Cheap deep equal comparison
    if (JSON.stringify(project.extensions.i18n) !== JSON.stringify(i18n)) {
      project.extensions.i18n = i18n as any;
      await workspaces.writeWorkspace(workspace, this._host);
    }
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

  private _i18nLocale(target: TranslationTarget) {
    const translation = relative(this._workspaceRoot, this._targetPathBuilder.createPath(target));
    return target.baseHref && target.baseHref !== target.language
      ? { translation, baseHref: target.baseHref }
      : translation;
  }
}
