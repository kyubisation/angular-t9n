import {
  MOCK_LINK_HELPER,
  MOCK_PERSISTANCE_STRATEGY,
  MOCK_TARGET_DE,
  MOCK_TARGET_REGISTRY,
} from '../../../test';
import { TargetUnitResponse } from '../models';

import { TargetUnitsController } from './target-units.controller';

describe('TargetUnitsController', () => {
  let controller: TargetUnitsController;

  beforeEach(() => {
    controller = new TargetUnitsController(
      MOCK_TARGET_REGISTRY,
      MOCK_PERSISTANCE_STRATEGY,
      MOCK_LINK_HELPER
    );
  });

  it('should return pagination', () => {
    const response = controller.getPagination(MOCK_TARGET_DE.language, {});
    expect(response.currentPage).toEqual(0);
    expect(response.totalEntries).toEqual(MOCK_TARGET_DE.units.length);
  });

  for (const sort of ['id', 'description', 'meaning', 'source', 'target', 'state']) {
    it(`should return sorted pagination with ${sort}`, () => {
      const page = controller.getPagination(MOCK_TARGET_DE.language, { sort });
      const responseIds = (page._embedded!.entries as TargetUnitResponse[]).map((u) => u.id);
      const stringify = (value: string | number | boolean = '') => value.toString();
      const sortedIds = MOCK_TARGET_DE.units
        .slice()
        .sort((a, b) => stringify((a as any)[sort]).localeCompare(stringify((b as any)[sort])))
        .map((u) => u.id);
      expect(responseIds).toEqual(sortedIds);
    });
  }

  for (const filter of ['id', 'description', 'meaning', 'source', 'target', 'state']) {
    it(`should return filtered pagination with ${filter}`, async () => {
      const unit = MOCK_TARGET_DE.units[0];
      const page = controller.getPagination(MOCK_TARGET_DE.language, {
        [filter]: (unit as any)[filter],
      });
      const responseIds = (page._embedded!.entries as TargetUnitResponse[]).map((u) => u.id);
      const sortedIds = MOCK_TARGET_DE.units
        .slice()
        .filter(
          (u) => (u as any)[filter] && (u as any)[filter].toString().includes((unit as any)[filter])
        )
        .map((u) => u.id);
      expect(responseIds).toEqual(sortedIds);
    });
  }

  it('should throw on non-existant target', () => {
    expect(() => controller.getPagination('does-not-exist', {})).toThrow();
  });

  it('should return target unit', () => {
    const unit = MOCK_TARGET_DE.units[0];
    const response = controller.getTargetUnit(MOCK_TARGET_DE.language, unit.id);
    expect(response.id).toEqual(unit.id);
    expect(response.source).toEqual(unit.source);
    expect(response.target).toEqual(unit.target);
  });

  it('should throw on getting unit with non-existant target', () => {
    expect(() => controller.getTargetUnit('does-not-exist', 'does-not-exist')).toThrow();
  });

  it('should throw on getting unit with non-existant target unit', () => {
    expect(() => controller.getTargetUnit(MOCK_TARGET_DE.language, 'does-not-exist')).toThrow();
  });

  it('should throw on updating target unit with non-existant target', () => {
    expect(() =>
      controller.updateTargetUnit('does-not-exist', 'does-not-exist', {} as any)
    ).toThrow();
  });

  it('should throw on updating target unit with non-existant target orphan', () => {
    expect(() =>
      controller.updateTargetUnit(MOCK_TARGET_DE.language, 'does-not-exist', {} as any)
    ).toThrow();
  });
});
