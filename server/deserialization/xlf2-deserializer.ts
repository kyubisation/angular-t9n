import { Injectable } from '@nestjs/common';

import { TranslationSourceUnit, TranslationTargetUnit } from '../models';

import { XlfDeserializerBase } from './xlf-deserializer-base';
import { XmlParser } from './xml-parser';

@Injectable()
export class Xlf2Deserializer extends XlfDeserializerBase {
  constructor(parser: XmlParser) {
    super(parser);
  }

  deserializeSource(content: string) {
    const doc = this._createDocument(content);
    const language = doc.documentElement.getAttribute('srcLang')!;
    const fileNode = this._getFileNode(doc);
    const unitMap = Array.from(fileNode.childNodes)
      .filter((c) => c.nodeName === 'unit')
      .map((u) => this._deserializeSourceUnit(u as Element))
      .reduce(
        (current, next) => current.set(next.id, next),
        new Map<string, TranslationSourceUnit>(),
      );
    return { language, unitMap };
  }

  deserializeTarget(content: string) {
    const doc = this._createDocument(content);
    const language = doc.documentElement.getAttribute('trgLang')!;
    this._assertTargetLanguage(language);
    const fileNode = this._getFileNode(doc);
    const unitMap = Array.from(fileNode.childNodes)
      .filter((c) => c.nodeName === 'unit')
      .map((u) => this._deserializeTargetUnit(u as Element))
      .reduce(
        (current, next) => current.set(next.id, next),
        new Map<string, TranslationTargetUnit>(),
      );
    return { language, unitMap };
  }

  protected _assertXliff(doc: Document) {
    super._assertXliff(doc);
    if (doc.documentElement.getAttribute('version') !== '2.0') {
      throw new Error(
        `Expected the xliff tag to have a version attribute with value '2.0' (<xliff version="2.0" ...)`,
      );
    } else if (!doc.documentElement.getAttribute('srcLang')) {
      throw new Error(
        `Expected the xliff tag to have a srcLang attribute (e.g. <xliff srcLang="en" ...)`,
      );
    }
  }

  private _deserializeTargetUnit(unit: Element): TranslationTargetUnit {
    const segment = unit.getElementsByTagName('segment')[0];
    return {
      ...this._deserializeSourceUnit(unit),
      target: this._extractTarget(segment),
      state: this._extractState(segment),
    };
  }

  private _deserializeSourceUnit(unitElement: Element): TranslationSourceUnit {
    const unit: TranslationSourceUnit = {
      id: unitElement.getAttribute('id')!,
      source: this._extractSource(unitElement.getElementsByTagName('segment')[0]),
    };
    const notesElement = unitElement.getElementsByTagName('notes')[0];
    if (!notesElement) {
      return unit;
    }

    unit.description = this._extractNote(notesElement, 'description')[0];
    unit.meaning = this._extractNote(notesElement, 'meaning')[0];
    const locations = this._extractNote(notesElement, 'location');
    unit.locations = locations.length ? locations : undefined;

    return unit;
  }

  private _extractSource(segment: Element) {
    return this._convertToString(segment.getElementsByTagName('source')[0]);
  }

  private _extractTarget(segment: Element) {
    const node = segment.getElementsByTagName('target')[0];
    if (!node) {
      return '';
    }
    return this._convertToString(node);
  }

  private _extractNote(notes: Element, category: string): string[] {
    return Array.from(notes.getElementsByTagName('note'))
      .filter((n) => n.getAttribute('category') === category && n.textContent)
      .map((n) => n.textContent!);
  }

  private _extractState(segment: Element) {
    const state = segment.getAttribute('state');
    return state === 'translated' || state === 'reviewed' || state === 'final' ? state : 'initial';
  }
}
