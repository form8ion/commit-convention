import {applyEnhancers} from '@form8ion/core';

import any from '@travi/any';
import {describe, expect, it, vi} from 'vitest';
import {when} from 'jest-when';

import * as semanticReleasePlugin from './semantic-release/index.js';
import lift from './lifter.js';

vi.mock('@form8ion/core');

describe('lifter', () => {
  it('should apply the enhancers', async () => {
    const projectRoot = any.string();
    const enhancerResults = any.simpleObject();
    when(applyEnhancers)
      .calledWith({options: {projectRoot}, enhancers: {'semantic-release': semanticReleasePlugin}})
      .mockResolvedValue(enhancerResults);

    expect(await lift({projectRoot})).toEqual(enhancerResults);
  });
});
