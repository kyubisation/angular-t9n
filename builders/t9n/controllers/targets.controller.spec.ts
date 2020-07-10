import { MOCK_LINK_HELPER, MOCK_TARGET_DE, MOCK_TARGET_REGISTRY } from '../../../test';

import { TargetsController } from './targets.controller';

describe('TargetsController', () => {
  let controller: TargetsController;

  beforeEach(() => {
    controller = new TargetsController(MOCK_TARGET_REGISTRY, MOCK_LINK_HELPER);
  });

  it('should return targets response', () => {
    const response = controller.targets();
    expect(response.languages).toEqual(MOCK_TARGET_REGISTRY.keys());
  });

  it('should return target response', () => {
    const response = controller.target(MOCK_TARGET_DE.language);
    expect(response.language).toEqual(MOCK_TARGET_DE.language);
  });

  it('should throw on non-existant target', () => {
    expect(() => controller.target('does-not-exist')).toThrow();
  });

  it('should throw on creating existing target', () => {
    expect(controller.createTarget(MOCK_TARGET_DE.language)).rejects.toThrow();
  });

  it('should create a target', async () => {
    const target = await controller.createTarget('fr');
    expect(target.language).toEqual('fr');
  });
});
