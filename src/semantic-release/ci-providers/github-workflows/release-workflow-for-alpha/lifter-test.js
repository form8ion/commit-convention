import {promises as fs} from 'fs';
import jsYaml from 'js-yaml';
import * as core from '@form8ion/core';

import any from '@travi/any';
import sinon from 'sinon';
import {assert} from 'chai';

import * as scaffolder from './scaffolder';
import lift from './lifter';

suite('release workflow lifter', () => {
  let sandbox;
  const projectRoot = any.string();
  const workflowsDirectory = `${projectRoot}/.github/workflows`;
  const pathToReleaseWorkflowFile = `${workflowsDirectory}/release.yml`;
  const existingWorkflowContents = any.string();

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(scaffolder, 'default');
    sandbox.stub(core, 'fileExists');
    sandbox.stub(fs, 'readFile');
    sandbox.stub(jsYaml, 'load');
  });

  teardown(() => sandbox.restore());

  test('that the scaffolder is called when a release workflow does not exist', async () => {
    core.fileExists.resolves(false);

    await lift({projectRoot});

    assert.calledWith(scaffolder.default, {projectRoot});
  });

  test('that the scaffolder is re-run when the release workflow is dispatchable', async () => {
    core.fileExists.withArgs(pathToReleaseWorkflowFile).resolves(true);
    fs.readFile.withArgs(pathToReleaseWorkflowFile, 'utf-8').resolves(existingWorkflowContents);
    jsYaml.load.withArgs(existingWorkflowContents).returns({on: {workflow_dispatch: {}}});

    await lift({projectRoot});

    assert.calledWith(scaffolder.default, {projectRoot});
  });

  test('that the scaffolder is not called when a modern release workflow already exists', async () => {
    core.fileExists.withArgs(pathToReleaseWorkflowFile).resolves(true);
    fs.readFile.withArgs(pathToReleaseWorkflowFile, 'utf-8').resolves(existingWorkflowContents);
    jsYaml.load.withArgs(existingWorkflowContents).returns({on: {}});

    await lift({projectRoot});

    assert.notCalled(scaffolder.default);
  });
});