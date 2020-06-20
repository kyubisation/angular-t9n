import { MOCK_LINK_HELPER, MOCK_SOURCE, MOCK_TARGET_REGISTRY } from '../../../test';

import { SourceUnitsController } from './source-units.controller';

describe('SourceUnitsController', () => {
  let controller: SourceUnitsController;

  beforeEach(() => {
    controller = new SourceUnitsController(MOCK_SOURCE, MOCK_TARGET_REGISTRY, MOCK_LINK_HELPER);
  });

  it('should return pagination', () => {
    const response = controller.getPagination({});
    expect(response.currentPage).toEqual(0);
    expect(response.totalEntries).toEqual(MOCK_SOURCE.units.length);
  });

  it('should return source unit', () => {
    const unit = MOCK_SOURCE.units[0];
    const response = controller.getSourceUnit(unit.id);
    expect(response.id).toEqual(unit.id);
    expect(response.source).toEqual(unit.source);
  });

  it('should throw on non-existant source unit', () => {
    expect(() => controller.getSourceUnit('does-not-exist')).toThrow();
  });
});
