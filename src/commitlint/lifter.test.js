import {promises as fs} from 'node:fs';
import {fileExists} from '@form8ion/core';

import {describe, expect, it, vi} from 'vitest';
import any from '@travi/any';
import {when} from 'jest-when';

import scaffoldCommitlint from './scaffolder.js';
import liftCommitlint from './lifter.js';

vi.mock('node:fs');
vi.mock('@form8ion/core');
vi.mock('./scaffolder.js');

describe('commitlint lifter', () => {
  const projectRoot = any.string();
  const commitlintConfig = any.simpleObject();
  const configs = {commitlint: commitlintConfig};

  it('should return an empty result when config does not need the format to be changed', async () => {
    when(fileExists).calledWith(`${projectRoot}/.commitlintrc.js`).mockResolvedValue(false);
    when(fileExists).calledWith(`${projectRoot}/.commitlintrc.cjs`).mockResolvedValue(false);

    expect(await liftCommitlint({projectRoot, configs})).toEqual({});

    expect(scaffoldCommitlint).not.toHaveBeenCalled();
    expect(fs.unlink).not.toHaveBeenCalled();
  });

  it('should migrate the config to json format if currently using js format', async () => {
    const scaffoldResult = any.simpleObject();
    when(fileExists).calledWith(`${projectRoot}/.commitlintrc.js`).mockResolvedValue(true);
    when(fileExists).calledWith(`${projectRoot}/.commitlintrc.cjs`).mockResolvedValue(false);
    when(scaffoldCommitlint).calledWith({projectRoot, config: commitlintConfig}).mockResolvedValue(scaffoldResult);

    expect(await liftCommitlint({projectRoot, configs})).toEqual(scaffoldResult);
    expect(fs.unlink).toHaveBeenCalledWith(`${projectRoot}/.commitlintrc.js`);
  });

  it('should migrate the config to json format if currently using cjs format', async () => {
    const scaffoldResult = any.simpleObject();
    when(fileExists).calledWith(`${projectRoot}/.commitlintrc.js`).mockResolvedValue(false);
    when(fileExists).calledWith(`${projectRoot}/.commitlintrc.cjs`).mockResolvedValue(true);
    when(scaffoldCommitlint).calledWith({projectRoot, config: commitlintConfig}).mockResolvedValue(scaffoldResult);

    expect(await liftCommitlint({projectRoot, configs})).toEqual(scaffoldResult);
    expect(fs.unlink).toHaveBeenCalledWith(`${projectRoot}/.commitlintrc.cjs`);
  });
});
