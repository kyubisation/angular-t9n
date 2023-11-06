import { Injectable } from '@nestjs/common';

import { TranslationTarget, TranslationTargetUnit } from '../models';

import { SerializationOptions } from './serialization-options';
import { TranslationSerializer } from './translation-serializer';

@Injectable()
export class XlfSerializer extends TranslationSerializer {
  constructor(private _options: SerializationOptions) {
    super();
  }

  serializeTarget(target: TranslationTarget): string {
    const units = [...target.units, ...target.orphans.map((o) => o.unit)];
    return `<?xml version="1.0" encoding="UTF-8"?>
<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
  <file source-language="${
    target.source.language
  }" datatype="plaintext" original="ng2.template" target-language="${target.language}">
    <body>
${units
  .map(
    (u) => `      <trans-unit id="${u.id}" datatype="html">
        <source>${u.source}</source>
        <target state="${this._transformState(u.state)}">${u.target}</target>${
          !this._options.includeContextInTarget ? '' : this._serializeNotes(u, target)
        }
      </trans-unit>`,
  )
  .join('\n')}
    </body>
  </file>
</xliff>
`;
  }

  private _transformState(state: string) {
    switch (state) {
      case 'final':
        return 'final';
      case 'reviewed':
        return 'signed-off';
      case 'translated':
        return 'translated';
      default:
        return 'new';
    }
  }

  private _serializeNotes(unit: TranslationTargetUnit, target: TranslationTarget) {
    const sourceUnit = target.source.unitMap.get(unit.id) || unit;
    let notes = '';
    for (const location of sourceUnit.locations || []) {
      const [sourcefile, linenumber] = location.split(':');
      notes += `
        <context-group purpose="location">
          <context context-type="sourcefile">${sourcefile}</context>
          <context context-type="linenumber">${linenumber}</context>
        </context-group>`;
    }
    notes += sourceUnit.description
      ? `
        <note priority="1" from="description">${sourceUnit.description}</note>`
      : '';
    notes += sourceUnit.meaning
      ? `
        <note priority="1" from="meaning">${sourceUnit.meaning}</note>`
      : '';
    return notes;
  }
}
