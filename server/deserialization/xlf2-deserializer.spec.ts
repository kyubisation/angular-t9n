import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
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
    assert.throws(() => deserializer.deserializeSource(content), {
      message: /^Expected the xliff tag to have a version attribute with value '2.0'/,
    });
  });

  it('should fail with missing source language', () => {
    const content = readFileSync(missingSourceLanguageFile, 'utf8');
    assert.throws(() => deserializer.deserializeSource(content), {
      message: /^Expected the xliff tag to have a srcLang attribute/,
    });
  });

  it('should fail with encoding mismatch', () => {
    const content = readFileSync(encodingMismatchFile, 'utf8');
    assert.throws(() => deserializer.deserializeSource(content), {
      message: /^angular-t9n only supports UTF-8/,
    });
  });

  describe('should deserialize xlf 2.0 source', () => {
    const content = readFileSync(sourceFile, 'utf8');

    it('language', () => {
      const result = deserializer.deserializeSource(content);
      assert.equal(result.language, 'en');
    });

    it('units', () => {
      const result = deserializer.deserializeSource(content);
      assert.deepEqual(Array.from(result.unitMap.keys()), ['82167058490521791', 'exampleId']);
    });

    it('unit 82167058490521791', () => {
      const result = deserializer.deserializeSource(content);
      const unit = result.unitMap.get('82167058490521791')!;
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
        'Example with <ph id="0" equiv="ICU" disp="{amount, plural, =0 {...} =1 {...} other {...}}"/>',
      );
      assert.deepEqual(unit.locations, [
        'app/i18n-examples-template/i18n-examples-template.component.html:3',
      ]);
      assert.equal(unit.description, 'titleDescription');
      assert.equal(unit.meaning, 'titleMeaning');
    });
  });

  describe('should deserialize xlf 2.0 target', () => {
    const content = readFileSync(targetFile, 'utf8');

    it('language', () => {
      const result = deserializer.deserializeTarget(content);
      assert.equal(result.language, 'de');
    });

    it('units', () => {
      const result = deserializer.deserializeTarget(content);
      assert.deepEqual(Array.from(result.unitMap.keys()), [
        '82167058490521791',
        'exampleId',
        'translated',
        'final',
      ]);
    });

    it('unit 82167058490521791', () => {
      const result = deserializer.deserializeTarget(content);
      const unit = result.unitMap.get('82167058490521791')!;
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
        'Example with <ph id="0" equiv="ICU" disp="{amount, plural, =0 {...} =1 {...} other {...}}"/>',
      );
      assert.equal(
        unit.target,
        'Beispiel mit <ph id="0" equiv="ICU" disp="{amount, plural, =0 {...} =1 {...} other {...}}"/>',
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
