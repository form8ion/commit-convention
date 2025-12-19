import {fileExists} from '@form8ion/core';

import {afterEach, describe, expect, it, vi} from 'vitest';
import any from '@travi/any';
import {when} from 'vitest-when';

import testForCommitlint from './tester.js';

vi.mock('@form8ion/core');

describe('commitlint predicate', () => {
  const projectRoot = any.string();

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return `false` if none of the possible config files are found', async () => {
    fileExists.mockResolvedValue(false);

    expect(await testForCommitlint({projectRoot})).toBe(false);
  });

  it('should return `true` if a config file exists with a `.js` extension exists', async () => {
    when(fileExists).calledWith(`${projectRoot}/.commitlintrc.js`).thenResolve(true);

    expect(await testForCommitlint({projectRoot})).toBe(true);
  });

  it('should return `true` if a config file exists with a `.json` extension exists', async () => {
    when(fileExists).calledWith(`${projectRoot}/.commitlintrc.js`).thenResolve(false);
    when(fileExists).calledWith(`${projectRoot}/.commitlintrc.json`).thenResolve(true);

    expect(await testForCommitlint({projectRoot})).toBe(true);
  });

  it('should return `true` if a config file exists with a `.cjs` extension exists', async () => {
    when(fileExists).calledWith(`${projectRoot}/.commitlintrc.js`).thenResolve(false);
    when(fileExists).calledWith(`${projectRoot}/.commitlintrc.json`).thenResolve(false);
    when(fileExists).calledWith(`${projectRoot}/.commitlintrc.cjs`).thenResolve(true);

    expect(await testForCommitlint({projectRoot})).toBe(true);
  });
});
