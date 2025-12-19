import {applyEnhancers} from '@form8ion/core';

import any from '@travi/any';
import {describe, expect, it, vi} from 'vitest';
import {when} from 'vitest-when';

import * as semanticReleasePlugin from './semantic-release/index.js';
import * as commitlintPlugin from './commitlint/index.js';
import lift from './lifter.js';

vi.mock('@form8ion/core');

describe('lifter', () => {
  it('should apply the enhancers', async () => {
    const projectRoot = any.string();
    const configs = any.simpleObject();
    const enhancerResults = any.simpleObject();
    when(applyEnhancers)
      .calledWith({
        options: {projectRoot, configs},
        enhancers: {
          'semantic-release': semanticReleasePlugin,
          commitlint: commitlintPlugin
        }
      })
      .thenResolve(enhancerResults);

    expect(await lift({projectRoot, configs})).toEqual(enhancerResults);
  });
});
