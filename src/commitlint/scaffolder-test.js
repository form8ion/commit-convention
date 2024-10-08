import {fileTypes} from '@form8ion/core';
import configFile from '@form8ion/config-file';

import any from '@travi/any';
import {assert} from 'chai';
import sinon from 'sinon';

import scaffoldCommitlint from './scaffolder.js';

suite('commitlint scaffolder', () => {
  let sandbox;

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(configFile, 'write');
  });

  teardown(() => sandbox.restore());

  test('that config is writted and dependencies are defined', async () => {
    const configPackageName = any.word();
    const configName = any.word();
    const projectRoot = any.string();

    assert.deepEqual(
      await scaffoldCommitlint({projectRoot, config: {packageName: configPackageName, name: configName}}),
      {devDependencies: [configPackageName]}
    );
    assert.calledWith(
      configFile.write,
      {
        format: fileTypes.JSON,
        name: 'commitlint',
        config: {extends: [configName]},
        path: projectRoot
      }
    );
  });
});
