import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
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
    assert.throws(() => deserializer.deserializeSource(content), {
      message: /^Expected the xliff tag to have a version attribute with value '1.2'/,
    });
  });

  it('should fail with missing source language', () => {
    const content = readFileSync(missingSourceLanguageFile, 'utf8');
    assert.throws(() => deserializer.deserializeSource(content), {
      message: /^Expected the file tag to have a source-language attribute/,
    });
  });

  it('should fail with encoding mismatch', () => {
    const content = readFileSync(encodingMismatchFile, 'utf8');
    assert.throws(() => deserializer.deserializeSource(content), {
      message: /^angular-t9n only supports UTF-8/,
    });
  });

  describe('should deserialize xlf 1.2 source', () => {
    const content = readFileSync(sourceFile, 'utf8');

    it('language', () => {
      const result = deserializer.deserializeSource(content);
      assert.equal(result.language, 'en');
    });

    it('units', () => {
      const result = deserializer.deserializeSource(content);
      assert.deepEqual(Array.from(result.unitMap.keys()), [
        '4f883844115f7551053ac3a3d48afc1ea50281c1',
        'exampleId',
      ]);
    });

    it('unit 4f883844115f7551053ac3a3d48afc1ea50281c1', () => {
      const result = deserializer.deserializeSource(content);
      const unit = result.unitMap.get('4f883844115f7551053ac3a3d48afc1ea50281c1')!;
      assert.equal(unit.source, 'Empty example');
      assert.deepEqual(unit.locations, [
        'app/i18n-examples-template/i18n-examples-template.component.html:2',
        'app/i18n-examples-template/i18n-examples-template.component.html:17',
      ]);
    });

    it('unit exampleId', () => {
      const result = deserializer.deserializeSource(content);
      const unit = result.unitMap.get('exampleId')!;
      assert.equal(
        unit.source,
        'Example with <x id="ICU" equiv-text="{amount, plural, =0 {...} =1 {...} other {...}}"/>',
      );
      assert.deepEqual(unit.locations, [
        'app/i18n-examples-template/i18n-examples-template.component.html:3',
      ]);
      assert.equal(unit.description, 'titleDescription');
      assert.equal(unit.meaning, 'titleMeaning');
    });
  });

  describe('should deserialize xlf 1.2 target', () => {
    const content = readFileSync(targetFile, 'utf8');

    it('language', () => {
      const result = deserializer.deserializeTarget(content);
      assert.equal(result.language, 'de');
    });

    it('units', () => {
      const result = deserializer.deserializeTarget(content);
      assert.deepEqual(Array.from(result.unitMap.keys()), [
        '4f883844115f7551053ac3a3d48afc1ea50281c1',
        'exampleId',
        'translated',
        'final',
      ]);
    });

    it('unit 4f883844115f7551053ac3a3d48afc1ea50281c1', () => {
      const result = deserializer.deserializeTarget(content);
      const unit = result.unitMap.get('4f883844115f7551053ac3a3d48afc1ea50281c1')!;
      assert.equal(unit.source, 'Empty example');
      assert.equal(unit.target, 'Leeres Beispiel');
      assert.equal(unit.state, 'initial');
      assert.deepEqual(unit.locations, [
        'app/i18n-examples-template/i18n-examples-template.component.html:2',
        'app/i18n-examples-template/i18n-examples-template.component.html:17',
      ]);
    });

    it('unit exampleId', () => {
      const result = deserializer.deserializeTarget(content);
      const unit = result.unitMap.get('exampleId')!;
      assert.equal(
        unit.source,
        'Example with <x id="ICU" equiv-text="{amount, plural, =0 {...} =1 {...} other {...}}"/>',
      );
      assert.equal(
        unit.target,
        'Beispiel mit <x id="ICU" equiv-text="{amount, plural, =0 {...} =1 {...} other {...}}"/>',
      );
      assert.equal(unit.state, 'reviewed');
      assert.deepEqual(unit.locations, [
        'app/i18n-examples-template/i18n-examples-template.component.html:3',
      ]);
      assert.equal(unit.description, 'titleDescription');
      assert.equal(unit.meaning, 'titleMeaning');
    });

    it('unit translated', () => {
      const result = deserializer.deserializeTarget(content);
      const unit = result.unitMap.get('translated')!;
      assert.equal(unit.state, 'translated');
    });

    it('unit final', () => {
      const result = deserializer.deserializeTarget(content);
      const unit = result.unitMap.get('final')!;
      assert.equal(unit.state, 'final');
    });
  });
});
