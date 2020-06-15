import { Injectable } from '@nestjs/common';

import {
  QueryParams,
  TranslationOrphan,
  TranslationSourceUnit,
  TranslationTarget,
  TranslationTargetUnit,
} from './models';

@Injectable()
export class LinkHelper {
  root() {
    return `/api`;
  }

  sourceUnits(query?: QueryParams) {
    const route = '/api/source/units';
    return query && Object.keys(query).length
      ? `${route}?${new URLSearchParams(query).toString()}`
      : route;
  }

  sourceUnit(unitOrId: TranslationSourceUnit | string) {
    const id = typeof unitOrId === 'string' ? unitOrId : unitOrId.id;
    return `/api/source/units/${id}`;
  }

  targets() {
    return '/api/targets';
  }

  target(language: string) {
    return `/api/targets/${language}`;
  }

  targetUnits(target: TranslationTarget, query?: QueryParams) {
    const route = `/api/target/${target.language}/units`;
    return query && Object.keys(query).length
      ? `${route}?${new URLSearchParams(query).toString()}`
      : route;
  }

  targetUnit(unitOrId: TranslationTargetUnit | string, target: TranslationTarget) {
    const id = typeof unitOrId === 'string' ? unitOrId : unitOrId.id;
    return `/api/targets/${target.language}/units/${id}`;
  }

  targetOrphans(target: TranslationTarget, query?: QueryParams) {
    const route = `/api/target/${target.language}/orphans`;
    return query && Object.keys(query).length
      ? `${route}?${new URLSearchParams(query).toString()}`
      : route;
  }

  targetOrphan(unitOrId: TranslationOrphan | string, target: TranslationTarget) {
    const id = typeof unitOrId === 'string' ? unitOrId : unitOrId.unit.id;
    return `/api/targets/${target.language}/orphans/${id}`;
  }
}
