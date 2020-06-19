import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

import {
  QueryParams,
  TranslationOrphan,
  TranslationSourceUnit,
  TranslationTarget,
  TranslationTargetUnit,
} from './models';

@Injectable({ scope: Scope.REQUEST })
export class LinkHelper {
  private readonly _origin: string;

  constructor(@Inject(REQUEST) request: Request) {
    this._origin = request.get('host') ? `${request.protocol}://${request.get('host')}` : '';
  }

  root() {
    return `${this._origin}/api`;
  }

  sourceUnits(query?: QueryParams) {
    const route = `${this._origin}/api/source/units`;
    return query && Object.keys(query).length
      ? `${route}?${new URLSearchParams(query).toString()}`
      : route;
  }

  sourceUnit(unitOrId: TranslationSourceUnit | string) {
    const id = typeof unitOrId === 'string' ? unitOrId : unitOrId.id;
    return `${this._origin}/api/source/units/${id}`;
  }

  targets() {
    return `${this._origin}/api/targets`;
  }

  target(language: string) {
    return `${this._origin}/api/targets/${language}`;
  }

  targetUnits(target: TranslationTarget, query?: QueryParams) {
    const route = `${this._origin}/api/target/${target.language}/units`;
    return query && Object.keys(query).length
      ? `${route}?${new URLSearchParams(query).toString()}`
      : route;
  }

  targetUnit(unitOrId: TranslationTargetUnit | string, target: TranslationTarget) {
    const id = typeof unitOrId === 'string' ? unitOrId : unitOrId.id;
    return `${this._origin}/api/targets/${target.language}/units/${id}`;
  }

  targetOrphans(target: TranslationTarget, query?: QueryParams) {
    const route = `${this._origin}/api/target/${target.language}/orphans`;
    return query && Object.keys(query).length
      ? `${route}?${new URLSearchParams(query).toString()}`
      : route;
  }

  targetOrphan(unitOrId: TranslationOrphan | string, target: TranslationTarget) {
    const id = typeof unitOrId === 'string' ? unitOrId : unitOrId.unit.id;
    return `${this._origin}/api/targets/${target.language}/orphans/${id}`;
  }
}
