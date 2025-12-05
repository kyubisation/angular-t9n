import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { MOCK_LINK_HELPER, MOCK_SOURCE } from '../../test';

import { AppController } from './app.controller';

describe('AppController', () => {
  it('should return root response', () => {
    const controller = new AppController(MOCK_SOURCE, MOCK_LINK_HELPER);
    const result = controller.root();
    assert.equal(result.sourceLanguage, MOCK_SOURCE.language);
    assert.equal(result.unitCount, MOCK_SOURCE.units.length);
  });
});
