import {fileTypes} from '@form8ion/core';
import {write as writeConfigFile} from '@form8ion/config-file';

import any from '@travi/any';
import {describe, expect, it, vi} from 'vitest';

import scaffoldCommitlint from './scaffolder.js';

vi.mock('@form8ion/config-file');

describe('commitlint scaffolder', () => {
  it('should write the config and define dependencies', async () => {
    const configPackageName = any.word();
    const configName = any.word();
    const projectRoot = any.string();

    expect(await scaffoldCommitlint({projectRoot, config: {packageName: configPackageName, name: configName}}))
      .toEqual({devDependencies: [configPackageName]});
    expect(writeConfigFile).toHaveBeenCalledWith({
      format: fileTypes.JSON,
      name: 'commitlint',
      config: {extends: [configName]},
      path: projectRoot
    });
  });
});
