import { MOCK_LINK_HELPER, MOCK_SOURCE } from '../../test';

import { AppController } from './app.controller';

describe('AppController', () => {
  it('should return root response', () => {
    const controller = new AppController(MOCK_SOURCE, MOCK_LINK_HELPER);
    const result = controller.root();
    expect(result.sourceLanguage).toEqual(MOCK_SOURCE.language);
    expect(result.unitCount).toEqual(MOCK_SOURCE.units.length);
  });
});
