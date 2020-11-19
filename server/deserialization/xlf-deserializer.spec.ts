import { readFileSync } from 'fs';
import { join, resolve } from 'path';

import { XlfDeserializer } from './xlf-deserializer';
import { XmlParser } from './xml-parser';

describe('XlfDeserializer', () => {
  const deserializer = new XlfDeserializer(new XmlParser());
  const xlfTestPath = resolve(__dirname, '../../test/xlf');
  const sourceFile = join(xlfTestPath, 'messages.xlf');
  const targetFile = join(xlfTestPath, 'messages.de.xlf');
  const invalidVersionFile = join(xlfTestPath, 'messages.invalid-version.xlf');
  const missingSourceLanguageFile = join(xlfTestPath, 'messages.missing-source-language.xlf');
  const encodingMismatchFile = join(xlfTestPath, 'messages.encoding-mismatch.xlf');

  it('should fail with invalid xliff version', () => {
    const content = readFileSync(invalidVersionFile, 'utf8');
    expect(() => deserializer.deserializeSource(content)).toThrow(
      /^Expected the xliff tag to have a version attribute with value '1.2'/
    );
  });

  it('should fail with missing source language', () => {
    const content = readFileSync(missingSourceLanguageFile, 'utf8');
    expect(() => deserializer.deserializeSource(content)).toThrow(
      /^Expected the file tag to have a source-language attribute/
    );
  });

  it('should fail with encoding mismatch', () => {
    const content = readFileSync(encodingMismatchFile, 'utf8');
    expect(() => deserializer.deserializeSource(content)).toThrow(
      /^angular-t9n only supports UTF-8/
    );
  });

  describe('should deserialize xlf 1.2 source', () => {
    const content = readFileSync(sourceFile, 'utf8');

    it('language', () => {
      const result = deserializer.deserializeSource(content);
      expect(result.language).toEqual('en');
    });

    it('units', () => {
      const result = deserializer.deserializeSource(content);
      expect(Array.from(result.unitMap.keys())).toEqual([
        '4f883844115f7551053ac3a3d48afc1ea50281c1',
        'exampleId',
      ]);
    });

    it('unit 4f883844115f7551053ac3a3d48afc1ea50281c1', () => {
      const result = deserializer.deserializeSource(content);
      const unit = result.unitMap.get('4f883844115f7551053ac3a3d48afc1ea50281c1')!;
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
        'Example with <x id="ICU" equiv-text="{amount, plural, =0 {...} =1 {...} other {...}}"/>'
      );
      expect(unit.locations).toEqual([
        'app/i18n-examples-template/i18n-examples-template.component.html:3',
      ]);
      expect(unit.description).toEqual('titleDescription');
      expect(unit.meaning).toEqual('titleMeaning');
    });
  });

  describe('should deserialize xlf 1.2 target', () => {
    const content = readFileSync(targetFile, 'utf8');

    it('language', () => {
      const result = deserializer.deserializeTarget(content);
      expect(result.language).toEqual('de');
    });

    it('units', () => {
      const result = deserializer.deserializeTarget(content);
      expect(Array.from(result.unitMap.keys())).toEqual([
        '4f883844115f7551053ac3a3d48afc1ea50281c1',
        'exampleId',
        'translated',
        'final',
      ]);
    });

    it('unit 4f883844115f7551053ac3a3d48afc1ea50281c1', () => {
      const result = deserializer.deserializeTarget(content);
      const unit = result.unitMap.get('4f883844115f7551053ac3a3d48afc1ea50281c1')!;
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
        'Example with <x id="ICU" equiv-text="{amount, plural, =0 {...} =1 {...} other {...}}"/>'
      );
      expect(unit.target).toEqual(
        'Beispiel mit <x id="ICU" equiv-text="{amount, plural, =0 {...} =1 {...} other {...}}"/>'
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
