import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

import {
  QueryParams,
  TranslationSourceOrphan,
  TranslationSourceUnit,
  TranslationTarget,
  TranslationTargetOrphan,
  TranslationTargetUnit,
} from './models';

@Injectable({ scope: Scope.REQUEST })
export class LinkHelper {
  private readonly _origin: string;

  constructor(@Inject(REQUEST) request: Request) {
    const host = request.get('host');
    this._origin = host ? `${request.protocol}://${host}` : '';
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

  sourceOrphans(query?: QueryParams) {
    const route = `${this._origin}/api/source/orphans`;
    return query && Object.keys(query).length
      ? `${route}?${new URLSearchParams(query).toString()}`
      : route;
  }

  sourceOrphan(unitOrId: TranslationSourceOrphan | string) {
    const id = typeof unitOrId === 'string' ? unitOrId : unitOrId.unit.id;
    return `${this._origin}/api/source/orphans/${id}`;
  }

  targets() {
    return `${this._origin}/api/targets`;
  }

  target(language: string) {
    return `${this._origin}/api/targets/${language}`;
  }

  targetUnits(target: TranslationTarget, query?: QueryParams) {
    const route = `${this._origin}/api/targets/${target.language}/units`;
    return query && Object.keys(query).length
      ? `${route}?${new URLSearchParams(query).toString()}`
      : route;
  }

  targetUnit(unitOrId: TranslationTargetUnit | string, target: TranslationTarget) {
    const id = typeof unitOrId === 'string' ? unitOrId : unitOrId.id;
    return `${this._origin}/api/targets/${target.language}/units/${id}`;
  }

  targetOrphans(target: TranslationTarget, query?: QueryParams) {
    const route = `${this._origin}/api/targets/${target.language}/orphans`;
    return query && Object.keys(query).length
      ? `${route}?${new URLSearchParams(query).toString()}`
      : route;
  }

  targetOrphan(unitOrId: TranslationTargetOrphan | string, target: TranslationTarget) {
    const id = typeof unitOrId === 'string' ? unitOrId : unitOrId.unit.id;
    return `${this._origin}/api/targets/${target.language}/orphans/${id}`;
  }
}
