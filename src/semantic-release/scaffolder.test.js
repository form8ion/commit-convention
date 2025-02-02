import {mergeIntoExistingPackageJson} from '@form8ion/javascript-core';

import any from '@travi/any';
import {it, expect, describe, vi} from 'vitest';

import scaffoldSemanticRelease from './scaffolder.js';

vi.mock('@form8ion/javascript-core');

describe('semantic-release scaffolder', () => {
  it('should generate the version string', async () => {
    const projectRoot = any.string();

    expect(await scaffoldSemanticRelease({projectRoot})).toEqual({});
    expect(mergeIntoExistingPackageJson).toHaveBeenCalledWith({
      projectRoot,
      config: {version: '0.0.0-semantically-released'}
    });
  });
});
