import { join, normalize, relative, virtualFs, workspaces } from '@angular-devkit/core';

import {
  TargetPathBuilder,
  TranslationSource,
  TranslationTarget,
  TranslationTargetRegistry,
} from '../../../server';

import { AngularI18n } from './angular-i18n';

describe('AngularI18n', () => {
  const workspaceRoot = normalize(__dirname);
  const targetDirectory = join(workspaceRoot, 'locales');
  const sourceFile = join(targetDirectory, 'messages.xlf');
  const angularJsonPath = join(workspaceRoot, 'angular.json');
  const projectName = 'angular-t9n';
  const builder = new TargetPathBuilder(targetDirectory, sourceFile);
  let memoryHost: virtualFs.SimpleMemoryHost;
  let host: workspaces.WorkspaceHost;
  let angularI18n: AngularI18n;
  let translationContext: {
    source: TranslationSource;
    targetRegistry: TranslationTargetRegistry;
  };

  beforeEach(() => {
    memoryHost = new virtualFs.SimpleMemoryHost();
    host = workspaces.createWorkspaceHost(memoryHost);
    translationContext = null!;
  });

  async function setupI18n(i18n: any) {
    const angularJson = require('../../../angular.json');
    angularJson.projects[projectName].i18n = i18n;
    await host.writeFile(angularJsonPath, JSON.stringify(angularJson));
    angularI18n = new AngularI18n(
      host,
      workspaceRoot,
      projectName,
      builder,
      () => translationContext,
    );
  }

  describe('with i18n configured', () => {
    beforeEach(
      async () =>
        await setupI18n({
          sourceLocale: 'en',
          locales: {
            de: 'src/locale/xlf2/messages.de.xlf',
          },
        }),
    );

    it('should throw without source', () => {
      expect(angularI18n.update()).rejects.toThrow();
    });

    it('should return the source locale', async () => {
      const sourceLocale = await angularI18n.sourceLocale();
      expect(sourceLocale.code).toEqual('en');
      expect(sourceLocale.baseHref).toBeUndefined();
    });

    it('should return the target locales', async () => {
      const locales = await angularI18n.locales();
      expect(Object.keys(locales)).toEqual(['de']);
      const deLocale = locales.de;
      expect(deLocale.translation).toEqual(['src/locale/xlf2/messages.de.xlf']);
      expect(deLocale.baseHref).toBeUndefined();
    });

    it('should update the angular.json when changed', async () => {
      translationContext = {
        source: { language: 'en-US' } as TranslationSource,
        targetRegistry: {
          values: () => [
            { language: 'de' } as TranslationTarget,
            { language: 'de-CH' } as TranslationTarget,
          ],
        } as any,
      };
      await angularI18n.update();
      const ngJson = JSON.parse(await host.readFile(angularJsonPath));
      const dePath = relative(workspaceRoot, normalize(builder.createPath('de')));
      const deChPath = relative(workspaceRoot, normalize(builder.createPath('de-CH')));
      expect(ngJson.projects[projectName].i18n).toEqual({
        sourceLocale: 'en-US',
        locales: { de: ['src/locale/xlf2/messages.de.xlf', dePath], 'de-CH': deChPath },
      });
    });
  });

  describe('with i18n configured without locales', () => {
    beforeEach(
      async () =>
        await setupI18n({
          sourceLocale: {
            baseHref: '/en/',
            language: 'en-US',
          },
        }),
    );

    it('should update the angular.json when changed', async () => {
      translationContext = {
        source: { language: 'en-US' } as TranslationSource,
        targetRegistry: {
          values: () => [{ language: 'de' } as TranslationTarget],
        } as any,
      };
      await angularI18n.update();
      const ngJson = JSON.parse(await host.readFile(angularJsonPath));
      const dePath = relative(workspaceRoot, normalize(builder.createPath('de')));
      expect(ngJson.projects[projectName].i18n).toEqual({
        sourceLocale: {
          baseHref: '/en/',
          code: 'en-US',
        },
        locales: { de: dePath },
      });
    });
  });

  describe('with i18n configured with baseHref', () => {
    beforeEach(
      async () =>
        await setupI18n({
          sourceLocale: {
            code: 'en',
            baseHref: '/en/',
          },
          locales: {
            de: {
              translation: 'locales/xlf2/messages.de.xlf',
              baseHref: '/de/',
            },
            'de-CH': {
              translation: ['locales/xlf2/messages.de-CH.xlf', 'locales/xlf2/messages2.de-CH.xlf'],
              baseHref: '/de-CH/',
            },
            fr: 'locales/xlf2/messages.fr.xlf',
            'fr-CH': ['locales/xlf2/messages.fr-CH.xlf', 'locales/xlf2/messages2.fr-CH.xlf'],
          },
        }),
    );

    it('should return the source locale', async () => {
      const sourceLocale = await angularI18n.sourceLocale();
      expect(sourceLocale.code).toEqual('en');
      expect(sourceLocale.baseHref).toEqual('/en/');
    });

    it('should return the target locales', async () => {
      const locales = await angularI18n.locales();
      expect(Object.keys(locales)).toEqual(['de', 'de-CH', 'fr', 'fr-CH']);
      const deLocale = locales.de;
      expect(deLocale.translation).toEqual(['locales/xlf2/messages.de.xlf']);
      expect(deLocale.baseHref).toEqual('/de/');
    });

    it('should update the angular.json when changed', async () => {
      translationContext = {
        source: { language: 'en-US', baseHref: '/en-US/' } as TranslationSource,
        targetRegistry: {
          values: () => [
            { language: 'de', baseHref: '/de/' } as TranslationTarget,
            { language: 'de-CH', baseHref: '/de-CH/' } as TranslationTarget,
          ],
        } as any,
      };
      await angularI18n.update();
      const ngJson = JSON.parse(await host.readFile(angularJsonPath));
      const dePath = relative(workspaceRoot, normalize(builder.createPath('de')));
      const deChPath = relative(workspaceRoot, normalize(builder.createPath('de-CH')));
      expect(ngJson.projects[projectName].i18n).toEqual({
        sourceLocale: {
          code: 'en-US',
          baseHref: '/en-US/',
        },
        locales: {
          de: {
            translation: ['locales/xlf2/messages.de.xlf', dePath],
            baseHref: '/de/',
          },
          'de-CH': {
            translation: [
              'locales/xlf2/messages.de-CH.xlf',
              'locales/xlf2/messages2.de-CH.xlf',
              deChPath,
            ],
            baseHref: '/de-CH/',
          },
        },
      });
    });
  });

  describe('without i18n configured', () => {
    beforeEach(async () => await setupI18n(undefined));

    it('should return undefined for the source locale', async () => {
      const sourceLocale = await angularI18n.sourceLocale();
      expect(sourceLocale.code).toEqual('');
      expect(sourceLocale.baseHref).toBeUndefined();
    });

    it('should return the target locales', async () => {
      const locales = await angularI18n.locales();
      expect(Object.keys(locales)).toEqual([]);
    });
  });
});
