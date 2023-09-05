import {fileExists} from '@form8ion/core';

import {afterEach, describe, expect, it, vi} from 'vitest';
import any from '@travi/any';
import {when} from 'jest-when';

import testForCommitlint from './tester';

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
    when(fileExists).calledWith(`${projectRoot}/.commitlintrc.js`).mockResolvedValue(true);

    expect(await testForCommitlint({projectRoot})).toBe(true);
  });

  it('should return `true` if a config file exists with a `.json` extension exists', async () => {
    when(fileExists).calledWith(`${projectRoot}/.commitlintrc.js`).mockResolvedValue(false);
    when(fileExists).calledWith(`${projectRoot}/.commitlintrc.json`).mockResolvedValue(true);

    expect(await testForCommitlint({projectRoot})).toBe(true);
  });

  it('should return `true` if a config file exists with a `.cjs` extension exists', async () => {
    when(fileExists).calledWith(`${projectRoot}/.commitlintrc.js`).mockResolvedValue(false);
    when(fileExists).calledWith(`${projectRoot}/.commitlintrc.json`).mockResolvedValue(false);
    when(fileExists).calledWith(`${projectRoot}/.commitlintrc.cjs`).mockResolvedValue(true);

    expect(await testForCommitlint({projectRoot})).toBe(true);
  });
});
