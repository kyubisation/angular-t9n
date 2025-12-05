import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { MOCK_LINK_HELPER, MOCK_TARGET_DE, MOCK_TARGET_REGISTRY } from '../../test';

import { TargetsController } from './targets.controller';

describe('TargetsController', () => {
  let controller: TargetsController;

  beforeEach(() => {
    controller = new TargetsController(MOCK_TARGET_REGISTRY, MOCK_LINK_HELPER);
  });

  it('should return targets response', () => {
    const response = controller.targets();
    assert.deepEqual(response.languages, MOCK_TARGET_REGISTRY.keys());
  });

  it('should return target response', () => {
    const response = controller.target(MOCK_TARGET_DE.language);
    assert.equal(response.language, MOCK_TARGET_DE.language);
  });

  it('should throw on non-existant target', () => {
    assert.throws(() => controller.target('does-not-exist'));
  });

  it('should throw on creating existing target', async () => {
    await assert.rejects(controller.createTarget(MOCK_TARGET_DE.language));
  });

  it('should create a target', async () => {
    const target = await controller.createTarget('fr');
    assert.equal(target.language, 'fr');
  });
});
