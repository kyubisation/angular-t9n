import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { MOCK_LINK_HELPER, MOCK_SOURCE, MOCK_TARGET_REGISTRY } from '../../test';

import { SourceUnitsController } from './source-units.controller';

describe('SourceUnitsController', () => {
  let controller: SourceUnitsController;

  beforeEach(() => {
    controller = new SourceUnitsController(MOCK_SOURCE, MOCK_TARGET_REGISTRY, MOCK_LINK_HELPER);
  });

  it('should return pagination', () => {
    const response = controller.getPagination({});
    assert.equal(response.currentPage, 0);
    assert.equal(response.totalEntries, MOCK_SOURCE.units.length);
  });

  it('should return source unit', () => {
    const unit = MOCK_SOURCE.units[0];
    const response = controller.getSourceUnit(unit.id);
    assert.equal(response.id, unit.id);
    assert.equal(response.source, unit.source);
  });

  it('should throw on non-existant source unit', () => {
    assert.throws(() => controller.getSourceUnit('does-not-exist'));
  });
});
