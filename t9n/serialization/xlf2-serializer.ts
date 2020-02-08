import { writeFile } from 'fs';
import { promisify } from 'util';

import { TranslationTarget } from '../translation-target';
import { TranslationTargetUnit } from '../translation-target-unit';

import { TranslationSerializer } from './translation-serializer';

const writeFileAsync = promisify(writeFile);

export class Xlf2Serializer implements TranslationSerializer {
  async serializeTarget(
    target: TranslationTarget,
    options: {
      original: string;
      includeContextInTarget: boolean;
    }
  ): Promise<void> {
    const units = [...target.units, ...target.orphans.map(o => o.unit)];
    const content = `<?xml version="1.0" encoding="UTF-8"?>
<xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="${
      target.source.language
    }" trgLang="${target.language}">
  <file original="${options.original}" id="ngi18n">
${units
  .map(
    u => `    <unit id="${u.id}">${
      !options.includeContextInTarget ? '' : this._serializeNotes(u, target)
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
    await writeFileAsync(target.file, content + '\n', 'utf-8');
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
