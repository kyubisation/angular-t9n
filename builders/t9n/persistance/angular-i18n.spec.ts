import { join, normalize, relative, workspaces } from '@angular-devkit/core';
import { SimpleMemoryHost } from '@angular-devkit/core/src/virtual-fs/host';

import { TranslationSource, TranslationTarget } from '../models';

import { AngularI18n } from './angular-i18n';
import { TargetPathBuilder } from './target-path-builder';

describe('AngularI18n', () => {
  const workspaceRoot = normalize(__dirname);
  const targetDirectory = join(workspaceRoot, 'locales');
  const sourceFile = join(targetDirectory, 'messages.xlf');
  const angularJsonPath = join(workspaceRoot, 'angular.json');
  const projectName = 'angular-t9n';
  const builder = new TargetPathBuilder(targetDirectory, sourceFile);
  let memoryHost: SimpleMemoryHost;
  let host: workspaces.WorkspaceHost;
  let angularI18n: AngularI18n;

  beforeEach(() => {
    memoryHost = new SimpleMemoryHost();
    host = workspaces.createWorkspaceHost(memoryHost);
  });

  describe('with i18n configured', () => {
    beforeEach(async () => {
      const angularJson = require('../../../angular.json');
      angularJson.projects[projectName].i18n = {
        sourceLocale: 'en',
        locales: {
          de: 'src/locale/xlf2/messages.de.xlf',
        },
      };
      await host.writeFile(angularJsonPath, JSON.stringify(angularJson));
      angularI18n = new AngularI18n(host, workspaceRoot, projectName, builder);
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
      expect(deLocale.translation).toEqual('src/locale/xlf2/messages.de.xlf');
      expect(deLocale.baseHref).toBeUndefined();
    });

    it('should update the angular.json when changed', async () => {
      await angularI18n.update({ language: 'en-US' } as TranslationSource, [
        { language: 'de' } as TranslationTarget,
        { language: 'de-CH' } as TranslationTarget,
      ]);
      const ngJson = JSON.parse(await host.readFile(angularJsonPath));
      const dePath = relative(
        workspaceRoot,
        builder.createPath({ language: 'de' } as TranslationTarget)
      );
      const deChPath = relative(
        workspaceRoot,
        builder.createPath({ language: 'de-CH' } as TranslationTarget)
      );
      expect(ngJson.projects[projectName].i18n).toEqual({
        sourceLocale: 'en-US',
        locales: { de: dePath, 'de-CH': deChPath },
      });
    });
  });

  describe('with i18n configured with baseHref', () => {
    beforeEach(async () => {
      const angularJson = require('../../../angular.json');
      angularJson.projects[projectName].i18n = {
        sourceLocale: {
          code: 'en',
          baseHref: '/en/',
        },
        locales: {
          de: {
            translation: 'src/locale/xlf2/messages.de.xlf',
            baseHref: '/de/',
          },
        },
      };
      await host.writeFile(angularJsonPath, JSON.stringify(angularJson));
      angularI18n = new AngularI18n(host, workspaceRoot, projectName, builder);
    });

    it('should return the source locale', async () => {
      const sourceLocale = await angularI18n.sourceLocale();
      expect(sourceLocale.code).toEqual('en');
      expect(sourceLocale.baseHref).toEqual('/en/');
    });

    it('should return the target locales', async () => {
      const locales = await angularI18n.locales();
      expect(Object.keys(locales)).toEqual(['de']);
      const deLocale = locales.de;
      expect(deLocale.translation).toEqual('src/locale/xlf2/messages.de.xlf');
      expect(deLocale.baseHref).toEqual('/de/');
    });

    it('should update the angular.json when changed', async () => {
      await angularI18n.update({ language: 'en-US', baseHref: '/en-US/' } as TranslationSource, [
        { language: 'de', baseHref: '/de/' } as TranslationTarget,
        { language: 'de-CH', baseHref: '/de-CH/' } as TranslationTarget,
      ]);
      const ngJson = JSON.parse(await host.readFile(angularJsonPath));
      const dePath = relative(
        workspaceRoot,
        builder.createPath({ language: 'de' } as TranslationTarget)
      );
      const deChPath = relative(
        workspaceRoot,
        builder.createPath({ language: 'de-CH' } as TranslationTarget)
      );
      expect(ngJson.projects[projectName].i18n).toEqual({
        sourceLocale: {
          code: 'en-US',
          baseHref: '/en-US/',
        },
        locales: {
          de: {
            translation: dePath,
            baseHref: '/de/',
          },
          'de-CH': {
            translation: deChPath,
            baseHref: '/de-CH/',
          },
        },
      });
    });
  });

  describe('without i18n configured', () => {
    beforeEach(async () => {
      const angularJson = require('../../../angular.json');
      angularJson.projects[projectName].i18n = undefined;
      await host.writeFile(angularJsonPath, JSON.stringify(angularJson));
      angularI18n = new AngularI18n(host, workspaceRoot, projectName, builder);
    });

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
