import { TranslationSourceUnit, TranslationTargetUnit } from '../models';

import { TranslationDeserializationResult } from './translation-deserialization-result';
import { TranslationDeserializer } from './translation-deserializer';
import { XmlParser } from './xml-parser';

export abstract class XlfDeserializerBase implements TranslationDeserializer {
  private _parser = new XmlParser();

  abstract deserializeSource(
    content: string
  ): TranslationDeserializationResult<TranslationSourceUnit>;

  abstract deserializeTarget(
    content: string
  ): TranslationDeserializationResult<TranslationTargetUnit>;

  protected _createDocument(content: string) {
    const doc = this._parser.parse(content);
    this._assertEncoding(doc);
    this._assertXliff(doc);
    return doc;
  }

  private _assertEncoding(doc: Document) {
    const processingInstruction: ProcessingInstruction | undefined = Array.from(
      doc.childNodes
    ).find(c => c.nodeType === doc.PROCESSING_INSTRUCTION_NODE) as any;
    if (!processingInstruction) {
      return;
    }

    const match = processingInstruction.data.match(/encoding="([^"]+)"/);
    if (match && match[1].replace(/[ -]+/g, '').toUpperCase() !== 'UTF8') {
      throw new Error(
        `angular-t9n only supports UTF-8, but encoding ${
          match[1]
        } was detected '${doc.firstChild!.toString()}'`
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

  protected _assertTargetLanguage(targetLanguage: string) {
    if (!targetLanguage) {
      throw new Error(
        `Expected the xliff tag to have a trgLang attribute (e.g. <xliff trgLang="de-CH" ...)`
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
