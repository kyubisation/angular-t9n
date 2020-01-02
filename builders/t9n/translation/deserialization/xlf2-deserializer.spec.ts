import { join, resolve } from 'path';

import { Xlf2Deserializer } from './xlf2-deserializer';

describe('Xlf2Deserializer', () => {
  const deserializer = new Xlf2Deserializer();
  const xlfTestPath = resolve(__dirname, '../../../../test/xlf2');
  const sourceFile = join(xlfTestPath, 'messages.xlf');
  const targetFile = join(xlfTestPath, 'messages.de.xlf');
  const invalidVersionFile = join(xlfTestPath, 'messages.invalid-version.xlf');
  const missingSourceLanguageFile = join(xlfTestPath, 'messages.missing-source-language.xlf');
  const encodingMismatchFile = join(xlfTestPath, 'messages.encoding-mismatch.xlf');

  it('should fail with invalid xliff version', async () => {
    await expect(deserializer.deserializeSource(invalidVersionFile)).rejects.toThrow(
      /^Expected the xliff tag to have a version attribute with value '2.0'/
    );
  });

  it('should fail with missing source language', async () => {
    await expect(deserializer.deserializeSource(missingSourceLanguageFile)).rejects.toThrow(
      /^Expected the xliff tag to have a srcLang attribute/
    );
  });

  it('should fail with encoding mismatch', async () => {
    await expect(deserializer.deserializeSource(encodingMismatchFile)).rejects.toThrow(
      /^angular-t9n only supports UTF-8/
    );
  });

  describe('should deserialize xlf 2.0 source', () => {
    it('language', async () => {
      const result = await deserializer.deserializeSource(sourceFile);
      expect(result.language).toEqual('en');
    });

    it('original', async () => {
      const result = await deserializer.deserializeSource(sourceFile);
      expect(result.original).toEqual('ng.template');
    });

    it('units', async () => {
      const result = await deserializer.deserializeSource(sourceFile);
      expect(Array.from(result.unitMap.keys())).toEqual(['82167058490521791', 'exampleId']);
    });

    it('unit 82167058490521791', async () => {
      const result = await deserializer.deserializeSource(sourceFile);
      const unit = result.unitMap.get('82167058490521791')!;
      expect(unit.source).toEqual('Empty example');
      expect(unit.locations).toEqual([
        'app/i18n-examples-template/i18n-examples-template.component.html:2',
        'app/i18n-examples-template/i18n-examples-template.component.html:17'
      ]);
    });

    it('unit exampleId', async () => {
      const result = await deserializer.deserializeSource(sourceFile);
      const unit = result.unitMap.get('exampleId')!;
      expect(unit.source).toEqual(
        'Example with <ph id="0" equiv="ICU" disp="{amount, plural, =0 {...} =1 {...} other {...}}"/>'
      );
      expect(unit.locations).toEqual([
        'app/i18n-examples-template/i18n-examples-template.component.html:3'
      ]);
      expect(unit.description).toEqual('titleDescription');
      expect(unit.meaning).toEqual('titleMeaning');
    });
  });

  describe('should deserialize xlf 2.0 target', () => {
    it('language', async () => {
      const result = await deserializer.deserializeTarget(targetFile);
      expect(result.language).toEqual('de');
    });

    it('units', async () => {
      const result = await deserializer.deserializeTarget(targetFile);
      expect(Array.from(result.unitMap.keys())).toEqual([
        '82167058490521791',
        'exampleId',
        'translated',
        'final'
      ]);
    });

    it('unit 82167058490521791', async () => {
      const result = await deserializer.deserializeTarget(targetFile);
      const unit = result.unitMap.get('82167058490521791')!;
      expect(unit.source).toEqual('Empty example');
      expect(unit.target).toEqual('Leeres Beispiel');
      expect(unit.state).toEqual('initial');
      expect(unit.locations).toEqual([
        'app/i18n-examples-template/i18n-examples-template.component.html:2',
        'app/i18n-examples-template/i18n-examples-template.component.html:17'
      ]);
    });

    it('unit exampleId', async () => {
      const result = await deserializer.deserializeTarget(targetFile);
      const unit = result.unitMap.get('exampleId')!;
      expect(unit.source).toEqual(
        'Example with <ph id="0" equiv="ICU" disp="{amount, plural, =0 {...} =1 {...} other {...}}"/>'
      );
      expect(unit.target).toEqual(
        'Beispiel mit <ph id="0" equiv="ICU" disp="{amount, plural, =0 {...} =1 {...} other {...}}"/>'
      );
      expect(unit.state).toEqual('reviewed');
      expect(unit.locations).toEqual([
        'app/i18n-examples-template/i18n-examples-template.component.html:3'
      ]);
      expect(unit.description).toEqual('titleDescription');
      expect(unit.meaning).toEqual('titleMeaning');
    });

    it('unit translated', async () => {
      const result = await deserializer.deserializeTarget(targetFile);
      const unit = result.unitMap.get('translated')!;
      expect(unit.state).toEqual('translated');
    });

    it('unit final', async () => {
      const result = await deserializer.deserializeTarget(targetFile);
      const unit = result.unitMap.get('final')!;
      expect(unit.state).toEqual('final');
    });
  });
});
