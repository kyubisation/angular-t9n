import { Injectable } from '@nestjs/common';

@Injectable()
export class XmlParser {
  private _parser: DOMParser =
    typeof DOMParser === 'undefined'
      ? new (require('@xmldom/xmldom').DOMParser)()
      : new DOMParser();

  parse(content: string): Document {
    return this._parser.parseFromString(content, 'text/xml');
  }
}
