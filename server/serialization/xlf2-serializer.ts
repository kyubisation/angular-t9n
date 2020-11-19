import { Injectable } from '@nestjs/common';

import { TranslationTarget, TranslationTargetUnit } from '../models';

import { SerializationOptions } from './serialization-options';
import { TranslationSerializer } from './translation-serializer';

@Injectable()
export class Xlf2Serializer extends TranslationSerializer {
  constructor(private _options: SerializationOptions) {
    super();
  }

  serializeTarget(target: TranslationTarget): string {
    const units = [...target.units, ...target.orphans.map((o) => o.unit)];
    return `<?xml version="1.0" encoding="UTF-8"?>
<xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="${
      target.source.language
    }" trgLang="${target.language}">
  <file original="ng.template" id="ngi18n">
${units
  .map(
    (u) => `    <unit id="${u.id}">${
      !this._options.includeContextInTarget ? '' : this._serializeNotes(u, target)
    }
      <segment state="${u.state}">
        <source>${u.source}</source>
        <target>${u.target}</target>
      </segment>
    </unit>`
  )
  .join('\n')}
  </file>
</xliff>
`;
  }

  private _serializeNotes(unit: TranslationTargetUnit, target: TranslationTarget) {
    const sourceUnit = target.source.unitMap.get(unit.id) || unit;
    let notes = '';
    notes += sourceUnit.description
      ? `
        <note category="description">${sourceUnit.description}</note>`
      : '';
    notes += sourceUnit.meaning
      ? `
        <note category="meaning">${sourceUnit.meaning}</note>`
      : '';
    for (const location of sourceUnit.locations || []) {
      notes += `
        <note category="location">${location}</note>`;
    }

    return !notes
      ? ''
      : `
      <notes>${notes}
      </notes>`;
  }
}
