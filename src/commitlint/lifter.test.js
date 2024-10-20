import {describe, expect, it} from 'vitest';

import liftCommitlint from './lifter.js';

describe('commitlint lifter', () => {
  it('should return an empty result when config does not need the format to be changed', async () => {
    expect(await liftCommitlint()).toEqual({});
  });
});
