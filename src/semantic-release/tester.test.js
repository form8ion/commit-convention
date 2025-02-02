import {promises as fs} from 'node:fs';

import any from '@travi/any';
import {expect, it, describe, vi} from 'vitest';
import {when} from 'jest-when';

import determineIfSemanticReleaseIsConfigured from './tester.js';

vi.mock('node:fs');

describe('semantic-release predicate', () => {
  const projectRoot = any.string();

  it('should return `true` when semantic-release is configured for the project', async () => {
    when(fs.readFile)
      .calledWith(`${projectRoot}/package.json`, 'utf-8')
      .mockResolvedValue(JSON.stringify({...any.simpleObject(), version: '0.0.0-semantically-released'}));

    expect(await determineIfSemanticReleaseIsConfigured({projectRoot})).toBe(true);
  });

  it('should return `false` when semantic-release is not configured for the project', async () => {
    when(fs.readFile)
      .calledWith(`${projectRoot}/package.json`, 'utf-8')
      .mockResolvedValue(JSON.stringify(any.simpleObject()));

    expect(await determineIfSemanticReleaseIsConfigured({projectRoot})).toBe(false);
  });
});
