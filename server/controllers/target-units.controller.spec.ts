import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  generateTargets,
  MOCK_LINK_HELPER,
  MOCK_TARGET_DE,
  MOCK_TARGET_REGISTRY,
} from '../../test';
import { TargetUnitRequest, TargetUnitResponse } from '../models';

import { TargetUnitsController } from './target-units.controller';

describe('TargetUnitsController', () => {
  let controller: TargetUnitsController;

  beforeEach(() => {
    controller = new TargetUnitsController(MOCK_TARGET_REGISTRY, MOCK_LINK_HELPER);
  });

  it('should return pagination', () => {
    const response = controller.getPagination(MOCK_TARGET_DE.language, {});
    assert.equal(response.currentPage, 0);
    assert.equal(response.totalEntries, MOCK_TARGET_DE.units.length);
  });

  for (const sort of ['id', 'description', 'meaning', 'source', 'target', 'state']) {
    it(`should return sorted pagination with ${sort}`, () => {
      const page = controller.getPagination(MOCK_TARGET_DE.language, { sort });
      const responseIds = (page._embedded!.entries as TargetUnitResponse[]).map((u) => u.id);
      const stringify = (value: string | number | boolean = '') => value.toString();
      const sortedIds = MOCK_TARGET_DE.units
        .slice()
        .sort((a, b) => stringify((a as any)[sort]).localeCompare(stringify((b as any)[sort])))
        .map((u) => u.id)
        .slice(0, 10);
      assert.deepEqual(responseIds, sortedIds);
    });

    it(`should return second page reverse sorted pagination with ${sort}`, () => {
      const page = controller.getPagination(MOCK_TARGET_DE.language, {
        sort: `!${sort}`,
        page: '1',
      });
      const responseIds = (page._embedded!.entries as TargetUnitResponse[]).map((u) => u.id);
      const stringify = (value: string | number | boolean = '') => value.toString();
      const sortedIds = MOCK_TARGET_DE.units
        .slice()
        .sort((a, b) => stringify((a as any)[sort]).localeCompare(stringify((b as any)[sort])))
        .reverse()
        .map((u) => u.id)
        .slice(10, 20);
      assert.deepEqual(responseIds, sortedIds);
    });
  }

  for (const filter of ['id', 'description', 'meaning', 'source', 'target', 'state']) {
    it(`should return filtered pagination with ${filter}`, async () => {
      const unit = MOCK_TARGET_DE.units[1];
      const page = controller.getPagination(MOCK_TARGET_DE.language, {
        [filter]: (unit as any)[filter].substring(0, 10),
      });
      const responseIds = (page._embedded!.entries as TargetUnitResponse[]).map((u) => u.id);
      const sortedIds = MOCK_TARGET_DE.units
        .slice()
        .filter(
          (u) =>
            (u as any)[filter] && (u as any)[filter].toString().includes((unit as any)[filter]),
        )
        .map((u) => u.id)
        .slice(0, 10);
      assert.deepEqual(responseIds, sortedIds);
    });
  }

  it('should throw on non-existant target', () => {
    assert.throws(() => controller.getPagination('does-not-exist', {}));
  });

  it('should return target unit', () => {
    const unit = MOCK_TARGET_DE.units[0];
    const response = controller.getTargetUnit(MOCK_TARGET_DE.language, unit.id);
    assert.equal(response.id, unit.id);
    assert.equal(response.source, unit.source);
    assert.equal(response.target, unit.target);
  });

  it('should throw on getting unit with non-existant target', () => {
    assert.throws(() => controller.getTargetUnit('does-not-exist', 'does-not-exist'));
  });

  it('should throw on getting unit with non-existant target unit', () => {
    assert.throws(() => controller.getTargetUnit(MOCK_TARGET_DE.language, 'does-not-exist'));
  });

  it('should throw on updating target unit with non-existant target', () => {
    assert.throws(() => controller.updateTargetUnit('does-not-exist', 'does-not-exist', {} as any));
  });

  it('should throw on updating target unit with non-existant target orphan', () => {
    assert.throws(() =>
      controller.updateTargetUnit(MOCK_TARGET_DE.language, 'does-not-exist', {} as any),
    );
  });

  it('should update translation', () => {
    const { registry } = generateTargets();
    const target = registry.get('de')!;
    const unit = target.units[1];
    const update: TargetUnitRequest = { target: 'updated text', state: 'final' };
    assert.notEqual(unit.target, update.target);
    assert.notEqual(unit.state, update.state);
    controller = new TargetUnitsController(registry, MOCK_LINK_HELPER);
    const result = controller.updateTargetUnit(target.language, unit.id, update);
    assert.equal(result.target, update.target);
    assert.equal(result.state, update.state);
    const updatedUnit = target.units[1];
    assert.equal(updatedUnit.target, update.target);
    assert.equal(updatedUnit.state, update.state);
  });
});
