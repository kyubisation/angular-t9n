import { readFileSync } from 'fs';
import { join, resolve } from 'path';

import { Xlf2Deserializer } from './xlf2-deserializer';
import { XmlParser } from './xml-parser';

describe('Xlf2Deserializer', () => {
  const deserializer = new Xlf2Deserializer(new XmlParser());
  const xlfTestPath = resolve(__dirname, '../../test/xlf2');
  const sourceFile = join(xlfTestPath, 'messages.xlf');
  const targetFile = join(xlfTestPath, 'messages.de.xlf');
  const invalidVersionFile = join(xlfTestPath, 'messages.invalid-version.xlf');
  const missingSourceLanguageFile = join(xlfTestPath, 'messages.missing-source-language.xlf');
  const encodingMismatchFile = join(xlfTestPath, 'messages.encoding-mismatch.xlf');

  it('should fail with invalid xliff version', () => {
    const content = readFileSync(invalidVersionFile, 'utf8');
    expect(() => deserializer.deserializeSource(content)).toThrow(
      /^Expected the xliff tag to have a version attribute with value '2.0'/
    );
  });

  it('should fail with missing source language', () => {
    const content = readFileSync(missingSourceLanguageFile, 'utf8');
    expect(() => deserializer.deserializeSource(content)).toThrow(
      /^Expected the xliff tag to have a srcLang attribute/
    );
  });

  it('should fail with encoding mismatch', () => {
    const content = readFileSync(encodingMismatchFile, 'utf8');
    expect(() => deserializer.deserializeSource(content)).toThrow(
      /^angular-t9n only supports UTF-8/
    );
  });

  describe('should deserialize xlf 2.0 source', () => {
    const content = readFileSync(sourceFile, 'utf8');

    it('language', () => {
      const result = deserializer.deserializeSource(content);
      expect(result.language).toEqual('en');
    });

    it('units', () => {
      const result = deserializer.deserializeSource(content);
      expect(Array.from(result.unitMap.keys())).toEqual(['82167058490521791', 'exampleId']);
    });

    it('unit 82167058490521791', () => {
      const result = deserializer.deserializeSource(content);
      const unit = result.unitMap.get('82167058490521791')!;
      expect(unit.source).toEqual('Empty example');
      expect(unit.locations).toEqual([
        'app/i18n-examples-template/i18n-examples-template.component.html:2',
        'app/i18n-examples-template/i18n-examples-template.component.html:17',
      ]);
    });

    it('unit exampleId', () => {
      const result = deserializer.deserializeSource(content);
      const unit = result.unitMap.get('exampleId')!;
      expect(unit.source).toEqual(
        'Example with <ph id="0" equiv="ICU" disp="{amount, plural, =0 {...} =1 {...} other {...}}"/>'
      );
      expect(unit.locations).toEqual([
        'app/i18n-examples-template/i18n-examples-template.component.html:3',
      ]);
      expect(unit.description).toEqual('titleDescription');
      expect(unit.meaning).toEqual('titleMeaning');
    });
  });

  describe('should deserialize xlf 2.0 target', () => {
    const content = readFileSync(targetFile, 'utf8');

    it('language', () => {
      const result = deserializer.deserializeTarget(content);
      expect(result.language).toEqual('de');
    });

    it('units', () => {
      const result = deserializer.deserializeTarget(content);
      expect(Array.from(result.unitMap.keys())).toEqual([
        '82167058490521791',
        'exampleId',
        'translated',
        'final',
      ]);
    });

    it('unit 82167058490521791', () => {
      const result = deserializer.deserializeTarget(content);
      const unit = result.unitMap.get('82167058490521791')!;
      expect(unit.source).toEqual('Empty example');
      expect(unit.target).toEqual('Leeres Beispiel');
      expect(unit.state).toEqual('initial');
      expect(unit.locations).toEqual([
        'app/i18n-examples-template/i18n-examples-template.component.html:2',
        'app/i18n-examples-template/i18n-examples-template.component.html:17',
      ]);
    });

    it('unit exampleId', () => {
      const result = deserializer.deserializeTarget(content);
      const unit = result.unitMap.get('exampleId')!;
      expect(unit.source).toEqual(
        'Example with <ph id="0" equiv="ICU" disp="{amount, plural, =0 {...} =1 {...} other {...}}"/>'
      );
      expect(unit.target).toEqual(
        'Beispiel mit <ph id="0" equiv="ICU" disp="{amount, plural, =0 {...} =1 {...} other {...}}"/>'
      );
      expect(unit.state).toEqual('reviewed');
      expect(unit.locations).toEqual([
        'app/i18n-examples-template/i18n-examples-template.component.html:3',
      ]);
      expect(unit.description).toEqual('titleDescription');
      expect(unit.meaning).toEqual('titleMeaning');
    });

    it('unit translated', () => {
      const result = deserializer.deserializeTarget(content);
      const unit = result.unitMap.get('translated')!;
      expect(unit.state).toEqual('translated');
    });

    it('unit final', () => {
      const result = deserializer.deserializeTarget(content);
      const unit = result.unitMap.get('final')!;
      expect(unit.state).toEqual('final');
    });
  });
});
