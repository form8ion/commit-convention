import {assert} from 'chai';

import lift from './lifter';

suite('semantic-release lifter', () => {
  test('that rsults are returned', async () => {
    assert.deepEqual(await lift(), {});
  });
});
