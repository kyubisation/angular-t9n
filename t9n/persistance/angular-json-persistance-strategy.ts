import { join, logging, Path } from '@angular-devkit/core';

import { TranslationSource, TranslationTarget } from '../models';
import { SerializationStrategy } from '../serialization-strategy';

import { AngularI18n } from './angular-i18n';
import { AngularJsonPersistanceStrategyOptions } from './angular-json-persistance-strategy-options';
import { PersistanceStrategy } from './persistance-strategy';
import { TargetPathBuilder } from './target-path-builder';

export class AngularJsonPersistanceStrategy implements PersistanceStrategy {
  private constructor(
    readonly source: TranslationSource,
    readonly targets: Map<string, TranslationTarget>,
    private readonly _logger: logging.LoggerApi,
    private readonly _i18n: AngularI18n,
    private readonly _targetPathBuilder: TargetPathBuilder,
    private readonly _serializationContext: SerializationStrategy
  ) {}

  static async create({
    host,
    logger,
    project,
    serializationContext,
    sourceFile,
    targetDirectory,
    workspaceRoot
  }: AngularJsonPersistanceStrategyOptions) {
    const targetPathBuilder = new TargetPathBuilder(targetDirectory, sourceFile);
    const i18n = new AngularI18n(host, workspaceRoot, project, targetPathBuilder);
    const source = await this._source(sourceFile, i18n, serializationContext, logger);
    const targets = await this._targets(workspaceRoot, source, i18n, serializationContext);
    return new AngularJsonPersistanceStrategy(
      source,
      targets,
      logger,
      i18n,
      targetPathBuilder,
      serializationContext
    );
  }

  private static async _source(
    sourceFile: Path,
    i18n: AngularI18n,
    serializationContext: SerializationStrategy,
    logger: logging.LoggerApi
  ) {
    const result = await serializationContext.deserializeSource(sourceFile);
    const sourceLocale = await i18n.sourceLocale();
    if (result.language && sourceLocale.code && result.language !== sourceLocale.code) {
      logger.warn(
        `Source locale in angular.json is ${sourceLocale} but in the ` +
          ` source file ${sourceFile} it is ${result.language}.`
      );
    }

    const source = new TranslationSource(sourceLocale.code || result.language, result.unitMap);
    if (sourceLocale.baseHref) {
      source.baseHref = sourceLocale.baseHref;
    }

    return source;
  }

  private static async _targets(
    workspaceRoot: Path,
    source: TranslationSource,
    i18n: AngularI18n,
    serializationContext: SerializationStrategy
  ): Promise<Map<string, TranslationTarget>> {
    const locales = await i18n.locales();
    const targets = await Promise.all(
      Object.keys(locales).map(async language => {
        const locale = locales[language];
        const result = await serializationContext.deserializeTarget(
          join(workspaceRoot, locale.translation)
        );
        const target = new TranslationTarget(source, result.language, result.unitMap);
        if (locale.baseHref) {
          target.baseHref = locale.baseHref;
        }

        return target;
      })
    );
    return targets.reduce(
      (current, next) => current.set(next.language, next),
      new Map<string, TranslationTarget>()
    );
  }

  async create(language: string, baseHref?: string): Promise<TranslationTarget> {
    if (this.targets.has(language)) {
      throw new Error(`Language ${language} already exists!`);
    }

    const target = new TranslationTarget(this.source, language);
    if (baseHref) {
      target.baseHref = baseHref;
    }

    this.targets.set(target.language, target);
    await this._update(target);
    this._logger.info(
      `${this._timestamp()}: Created translation file for ${language} at ${this._targetPathBuilder.createPath(
        target
      )}`
    );
    return target;
  }

  async update(target: TranslationTarget): Promise<void> {
    await this._update(target);
    this._logger.info(
      `${this._timestamp()}: Updated translation file for ${
        target.language
      } at ${this._targetPathBuilder.createPath(target)}`
    );
  }

  private async _update(target: TranslationTarget): Promise<void> {
    const filePath = this._targetPathBuilder.createPath(target);
    await this._serializationContext.serializeTarget(target, filePath);
    await this._updateProjectI18n();
  }

  private async _updateProjectI18n(): Promise<void> {
    await this._i18n.update(this.source, Array.from(this.targets.values()));
  }

  private _timestamp() {
    const now = new Date();
    const pad = (value: number) => value.toString().padStart(2, '0');
    const date = [now.getFullYear(), now.getMonth() + 1, now.getDate()].map(pad).join('-');
    const time = [now.getHours(), now.getMinutes(), now.getSeconds()].map(pad).join(':');
    return `${date} ${time}`;
  }
}
