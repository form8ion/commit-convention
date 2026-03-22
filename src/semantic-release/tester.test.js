import {loadPackageJson} from '@form8ion/javascript-core';

import any from '@travi/any';
import {expect, it, describe, vi} from 'vitest';
import {when} from 'vitest-when';

import determineIfSemanticReleaseIsConfigured from './tester.js';

vi.mock('@form8ion/javascript-core');

describe('semantic-release predicate', () => {
  const projectRoot = any.string();

  it('should return `true` when semantic-release is configured for the project', async () => {
    when(loadPackageJson)
      .calledWith({projectRoot})
      .thenResolve({...any.simpleObject(), version: '0.0.0-semantically-released'});

    expect(await determineIfSemanticReleaseIsConfigured({projectRoot})).toBe(true);
  });

  it('should return `false` when semantic-release is not configured for the project', async () => {
    when(loadPackageJson).calledWith({projectRoot}).thenResolve(any.simpleObject());

    expect(await determineIfSemanticReleaseIsConfigured({projectRoot})).toBe(false);
  });
});
