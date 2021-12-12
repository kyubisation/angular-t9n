import { randomBytes } from 'crypto';
import { isObservable } from 'rxjs';

import {
  LinkHelper,
  OrphanRegistry,
  TranslationSource,
  TranslationSourceUnit,
  TranslationTarget,
  TranslationTargetRegistry,
  TranslationTargetUnit,
} from '../builders/t9n';

const generated = generateTargets();
export const MOCK_SOURCE = deepFreeze(generated.source);
export const MOCK_TARGET_DE = deepFreeze(generated.registry.get('de')!);
export const MOCK_TARGET_REGISTRY = deepFreeze(generated.registry);
export const MOCK_LINK_HELPER = deepFreeze(new LinkHelper({ get: () => '' } as any));

export function generateSourceUnit(amount = 100): TranslationSourceUnit[] {
  return Array.from({ length: amount }).map((_, i) => ({
    id: randomString(),
    source: randomJoinedString(),
    description: i % 3 ? randomJoinedString() : undefined,
    meaning: i % 2 ? randomJoinedString() : undefined,
    locations:
      i % 5 ? range(randomNumber(3)).map(() => randomString(randomNumber(30, 10))) : undefined,
  }));
}

export function generateSource(language = 'en') {
  return new TranslationSource(
    language,
    generateSourceUnit().reduce(
      (units, unit) => units.set(unit.id, unit),
      new Map<string, TranslationSourceUnit>()
    )
  );
}

export function generateTargets(languages: string[] = ['de']) {
  const source = generateSource();
  const registry = new TranslationTargetRegistry(source, {
    create(_target: TranslationTarget): Promise<void> {
      return Promise.resolve();
    },
    update(_target: TranslationTarget): Promise<void> {
      return Promise.resolve();
    },
  });
  const toTargetUnit = (unit: TranslationSourceUnit, i: number) => {
    const target = i % 5 ? randomJoinedString() : undefined;
    const pivot = i % 7;
    const state = target
      ? pivot < 4
        ? 'translated'
        : pivot < 6
        ? 'reviewed'
        : 'final'
      : 'initial';

    return { ...unit, target, state } as TranslationTargetUnit;
  };
  const orphans = generateSourceUnit(20);
  for (const language of languages) {
    const unitMap = source.units
      .map(toTargetUnit)
      .concat(orphans.map(toTargetUnit))
      .reduce((units, unit) => units.set(unit.id, unit), new Map<string, TranslationTargetUnit>());
    registry.register(language, unitMap);
  }
  return { source, registry };
}

export function generateOrphans() {
  const { registry, source } = generateTargets(['de', 'fr', 'it']);
  const orphanRegistry = new OrphanRegistry(registry, source);
  return { orphanRegistry, source };
}

function range(amount = 5) {
  return Array.from({ length: amount }).map((_, i) => i);
}

function randomNumber(max = 5, min = 0) {
  return (randomBytes(1).readUInt8(0) % (max + 1)) + min;
}

function randomNumbers(amount = 5, max = 10, min = 0) {
  return range(amount).map(() => randomNumber(max, min));
}

function randomString(amount = 20) {
  return randomBytes(amount).toString('hex');
}

function randomStrings(amount = 5, max = 20, min = 3) {
  return randomNumbers(amount, max, min).map((v) => randomString(v));
}

function randomJoinedString() {
  return randomStrings(randomNumber(10, 1)).join(' ');
}

function deepFreeze<T>(freezable: T & { [key: string]: any }) {
  Object.freeze(freezable);
  if (freezable === undefined) {
    return freezable;
  }

  Object.getOwnPropertyNames(freezable).forEach((prop) => {
    if (
      freezable[prop] !== null &&
      !isObservable(freezable[prop]) &&
      (typeof freezable[prop] === 'object' || typeof freezable[prop] === 'function') &&
      !Object.isFrozen(freezable[prop])
    ) {
      deepFreeze(freezable[prop]);
    }
  });

  return freezable;
}
