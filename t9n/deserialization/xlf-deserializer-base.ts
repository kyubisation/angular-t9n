import { readFile } from 'fs';
import { basename } from 'path';
import { promisify } from 'util';
import { DOMParser } from 'xmldom';

import { TranslationSourceUnit } from '../translation-source-unit';
import { TranslationTargetUnit } from '../translation-target-unit';

import { TranslationDeserializer } from './translation-deserializer';

const readFileAsync = promisify(readFile);

export abstract class XlfDeserializerBase implements TranslationDeserializer {
  private _parser = new DOMParser();

  abstract deserializeSource(
    file: string
  ): Promise<{
    language: string;
    original: string;
    unitMap: Map<string, TranslationSourceUnit>;
  }>;

  abstract deserializeTarget(
    file: string
  ): Promise<{ language: string; unitMap: Map<string, TranslationTargetUnit> }>;

  protected async _createDocument(file: string) {
    const content = await readFileAsync(file, 'utf-8');
    const doc = this._parser.parseFromString(content);
    this._assertEncoding(doc, file);
    this._assertXliff(doc);
    return doc;
  }

  private _assertEncoding(doc: Document, file: string) {
    const processingInstruction: ProcessingInstruction | undefined = Array.from(
      doc.childNodes
    ).find(c => c.nodeType === doc.PROCESSING_INSTRUCTION_NODE) as any;
    if (!processingInstruction) {
      return;
    }

    const match = processingInstruction.data.match(/encoding="([^"]+)"/);
    if (match && match[1].replace(/[ -]+/g, '').toUpperCase() !== 'UTF8') {
      throw new Error(
        `angular-t9n only supports UTF-8, but ${file} has encoding ${
          match[1]
        } '${doc.firstChild!.toString()}'`
      );
    }
  }

  protected _assertXliff(doc: Document) {
    if (doc.documentElement.nodeName !== 'xliff') {
      throw new Error(
        `Expected document element to be 'xliff' (instead of ${doc.documentElement.nodeName})`
      );
    } else if (
      Array.from(doc.documentElement.childNodes).filter(c => c.nodeName === 'file').length !== 1
    ) {
      throw new Error(`Expected exactly one <file> element in <xliff>`);
    }
  }

  protected _assertTargetLanguage(targetLanguage: string, file: string) {
    if (!targetLanguage) {
      throw new Error(
        `Expected the xliff tag to have a trgLang attribute (e.g. <xliff trgLang="de-CH" ...)`
      );
    } else if (!basename(file).includes(`.${targetLanguage}.`)) {
      throw new Error(
        `Expected the target language (${targetLanguage}) to be part of the filename ${file}`
      );
    }
  }

  protected _getFileNode(doc: Document) {
    return Array.from(doc.documentElement.childNodes).find(c => c.nodeName === 'file')! as Element;
  }

  protected _convertToString(node: Element) {
    if (!node.textContent && !node.childNodes.length) {
      return '';
    }

    const nodeText = node.toString();
    return nodeText.substring(
      nodeText.indexOf('>') + 1,
      nodeText.length - (node.nodeName.length + 3)
    );
  }
}
