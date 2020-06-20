import { readFileSync } from 'fs';
import { join } from 'path';

import {
  LinkHelper,
  PersistanceStrategy,
  TranslationSource,
  TranslationTarget,
  TranslationTargetRegistry,
  Xlf2Deserializer,
  XmlParser,
} from '../builders/t9n';

const deserializer = new Xlf2Deserializer(new XmlParser());
const sourceResult = deserializer.deserializeSource(
  readFileSync(join(__dirname, 'xlf2/messages.xlf'), 'utf8')
);
export const MOCK_SOURCE = deepFreeze(
  new TranslationSource(sourceResult.language, sourceResult.unitMap)
);
const targetResult = deserializer.deserializeTarget(
  readFileSync(join(__dirname, 'xlf2/messages.de.xlf'), 'utf8')
);
const target = new TranslationTarget(MOCK_SOURCE, targetResult.language, targetResult.unitMap);
Object.assign(target.units[0], { description: 'description', meaning: 'meaning' });
Object.assign(target.orphans[0].unit, { description: 'description', meaning: 'meaning' });
export const MOCK_TARGET_DE = deepFreeze(target);
export const MOCK_TARGET_REGISTRY = deepFreeze(
  new TranslationTargetRegistry().set('de', MOCK_TARGET_DE)
);
export const MOCK_LINK_HELPER = deepFreeze(new LinkHelper({ get: () => '' } as any));

export const MOCK_PERSISTANCE_STRATEGY: PersistanceStrategy = deepFreeze({
  languages(): string[] {
    return [MOCK_TARGET_DE.language];
  },
  get(language: string): TranslationTarget | undefined {
    return language === MOCK_TARGET_DE.language ? MOCK_TARGET_DE : undefined;
  },
  create(_language: string): Promise<TranslationTarget> {
    throw new Error('Not implemented');
  },
  update(_target: TranslationTarget): Promise<void> {
    return Promise.resolve();
  },
});

function deepFreeze<T>(freezable: T & { [key: string]: any }) {
  Object.freeze(freezable);
  if (freezable === undefined) {
    return freezable;
  }

  Object.getOwnPropertyNames(freezable).forEach(function (prop) {
    if (
      freezable[prop] !== null &&
      (typeof freezable[prop] === 'object' || typeof freezable[prop] === 'function') &&
      !Object.isFrozen(freezable[prop])
    ) {
      deepFreeze(freezable[prop]);
    }
  });

  return freezable;
}
