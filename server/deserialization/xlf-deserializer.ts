import { Injectable } from '@nestjs/common';

import { TranslationSourceUnit, TranslationTargetUnit } from '../models';

import { XlfDeserializerBase } from './xlf-deserializer-base';
import { XmlParser } from './xml-parser';

@Injectable()
export class XlfDeserializer extends XlfDeserializerBase {
  constructor(parser: XmlParser) {
    super(parser);
  }

  deserializeSource(content: string) {
    const doc = this._createDocument(content);
    const fileNode = this._getFileNode(doc);
    const language = fileNode.getAttribute('source-language')!;
    const unitMap = Array.from(fileNode.getElementsByTagName('trans-unit'))
      .map((u) => this._deserializeSourceUnit(u))
      .reduce(
        (current, next) => current.set(next.id, next),
        new Map<string, TranslationSourceUnit>(),
      );
    return { language, unitMap };
  }

  deserializeTarget(content: string) {
    const doc = this._createDocument(content);
    const fileNode = this._getFileNode(doc);
    const language = fileNode.getAttribute('target-language')!;
    this._assertTargetLanguage(language);
    const unitMap = Array.from(fileNode.getElementsByTagName('trans-unit'))
      .map((u) => this._deserializeTargetUnit(u))
      .reduce(
        (current, next) => current.set(next.id, next),
        new Map<string, TranslationTargetUnit>(),
      );
    return { language, unitMap };
  }

  protected _assertXliff(doc: Document) {
    super._assertXliff(doc);
    if (doc.documentElement.getAttribute('version') !== '1.2') {
      throw new Error(
        `Expected the xliff tag to have a version attribute with value '1.2' (<xliff version="1.2" ...)`,
      );
    } else if (!this._getFileNode(doc).getAttribute('source-language')) {
      throw new Error(
        `Expected the file tag to have a source-language attribute (e.g. <file source-language="en" ...)`,
      );
    }
  }

  private _deserializeTargetUnit(unit: Element): TranslationTargetUnit {
    return {
      ...this._deserializeSourceUnit(unit),
      target: this._extractTarget(unit),
      state: this._extractState(unit),
    };
  }

  private _deserializeSourceUnit(unitElement: Element): TranslationSourceUnit {
    const noteElements = Array.from(unitElement.getElementsByTagName('note'));
    const unit: TranslationSourceUnit = {
      id: unitElement.getAttribute('id')!,
      source: this._extractSource(unitElement),
      description:
        noteElements
          .filter((e) => e.getAttribute('from') === 'description')
          .map((e) => e.textContent)[0] || undefined,
      meaning:
        noteElements
          .filter((e) => e.getAttribute('from') === 'meaning')
          .map((e) => e.textContent)[0] || undefined,
    };

    const contextGroups = Array.from(unitElement.getElementsByTagName('context-group')).filter(
      (e) =>
        e.getAttribute('purpose') === 'location' && e.getElementsByTagName('context').length === 2,
    );
    if (contextGroups.length) {
      unit.locations = contextGroups
        .map((c) => Array.from(c.getElementsByTagName('context')))
        .map((context) => ({
          sourcefile: context.find((c) => c.getAttribute('context-type') === 'sourcefile'),
          linenumber: context.find((c) => c.getAttribute('context-type') === 'linenumber'),
        }))
        .filter((c) => c.sourcefile && c.linenumber)
        .map(
          (c) => `${this._convertToString(c.sourcefile!)}:${this._convertToString(c.linenumber!)}`,
        );
    }

    return unit;
  }

  private _extractSource(transUnit: Element) {
    return this._convertToString(transUnit.getElementsByTagName('source')[0]);
  }

  private _extractTarget(transUnit: Element) {
    return this._convertToString(transUnit.getElementsByTagName('target')[0]);
  }

  private _extractState(transUnit: Element) {
    const target = transUnit.getElementsByTagName('target')[0].getAttribute('state');
    switch (target) {
      case 'new':
      case 'needs-translation':
      case 'needs-adaptation':
      case 'needs-l10n':
      default:
        return 'initial';
      case 'translated':
      case 'needs-review-adaptation':
      case 'needs-review-l10n':
      case 'needs-review-translation	':
        return 'translated';
      case 'signed-off':
        return 'reviewed';
      case 'final':
        return 'final';
    }
  }
}
