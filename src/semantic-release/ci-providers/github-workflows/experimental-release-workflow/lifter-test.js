import {promises as fs} from 'fs';
import jsYaml from 'js-yaml';
import core from '@form8ion/core';

import any from '@travi/any';
import sinon from 'sinon';
import {assert} from 'chai';

import * as scaffolder from './scaffolder.js';
import lift from './lifter.js';

suite('release workflow lifter', () => {
  let sandbox;
  const projectRoot = any.string();
  const nodeVersion = any.string();
  const workflowsDirectory = `${projectRoot}/.github/workflows`;
  const pathToExperimentalReleaseWorkflowFile = `${workflowsDirectory}/experimental-release.yml`;
  const existingWorkflowContents = any.string();

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(scaffolder, 'default');
    sandbox.stub(core, 'fileExists');
    sandbox.stub(fs, 'readFile');
    sandbox.stub(fs, 'rename');
    sandbox.stub(jsYaml, 'load');
  });

  teardown(() => sandbox.restore());

  test('that the scaffolder is called when a release workflow does not exist', async () => {
    core.fileExists.resolves(false);

    await lift({projectRoot, nodeVersion});

    assert.calledWith(scaffolder.default, {projectRoot, nodeVersion});
    assert.notCalled(fs.rename);
  });

  test('that the scaffolder is re-run when the release workflow is dispatchable', async () => {
    core.fileExists.withArgs(pathToExperimentalReleaseWorkflowFile).resolves(true);
    fs.readFile.withArgs(pathToExperimentalReleaseWorkflowFile, 'utf-8').resolves(existingWorkflowContents);
    jsYaml.load.withArgs(existingWorkflowContents).returns({on: {workflow_dispatch: {}}});

    await lift({projectRoot, nodeVersion});

    assert.calledWith(scaffolder.default, {projectRoot, nodeVersion});
    assert.notCalled(fs.rename);
  });

  test('that the scaffolder is re-run when the release workflow does not restrict permissions', async () => {
    core.fileExists.withArgs(pathToExperimentalReleaseWorkflowFile).resolves(true);
    fs.readFile.withArgs(pathToExperimentalReleaseWorkflowFile, 'utf-8').resolves(existingWorkflowContents);
    jsYaml.load.withArgs(existingWorkflowContents).returns({on: {}});

    await lift({projectRoot, nodeVersion});

    assert.calledWith(scaffolder.default, {projectRoot, nodeVersion});
    assert.notCalled(fs.rename);
  });

  test('that the scaffolder is re-run when the release workflow does not restrict permissions enough', async () => {
    core.fileExists.withArgs(pathToExperimentalReleaseWorkflowFile).resolves(true);
    fs.readFile.withArgs(pathToExperimentalReleaseWorkflowFile, 'utf-8').resolves(existingWorkflowContents);
    jsYaml.load.withArgs(existingWorkflowContents).returns({on: {}, permissions: any.simpleObject()});

    await lift({projectRoot, nodeVersion});

    assert.calledWith(scaffolder.default, {projectRoot, nodeVersion});
    assert.notCalled(fs.rename);
  });

  test('that the scaffolder is re-run when the workflow does not properly restrict contents permission', async () => {
    core.fileExists.withArgs(pathToExperimentalReleaseWorkflowFile).resolves(true);
    fs.readFile.withArgs(pathToExperimentalReleaseWorkflowFile, 'utf-8').resolves(existingWorkflowContents);
    jsYaml.load.withArgs(existingWorkflowContents).returns({on: {}, permissions: {contents: 'write'}});

    await lift({projectRoot, nodeVersion});

    assert.calledWith(scaffolder.default, {projectRoot, nodeVersion});
    assert.notCalled(fs.rename);
  });

  test('that the scaffolder is not called when a modern release workflow already exists', async () => {
    core.fileExists.withArgs(pathToExperimentalReleaseWorkflowFile).resolves(true);
    fs.readFile.withArgs(pathToExperimentalReleaseWorkflowFile, 'utf-8').resolves(existingWorkflowContents);
    jsYaml.load.withArgs(existingWorkflowContents).returns({on: {}, permissions: {contents: 'read'}});

    await lift({projectRoot});

    assert.notCalled(scaffolder.default);
    assert.notCalled(fs.rename);
  });

  test('that a legacy release workflow is renamed to clarify that it is for experimental releases', async () => {
    const pathToLegacyReleaseWorkflowFile = `${workflowsDirectory}/release.yml`;
    core.fileExists.withArgs(pathToLegacyReleaseWorkflowFile).resolves(true);
    fs.readFile.withArgs(pathToExperimentalReleaseWorkflowFile, 'utf-8').resolves(existingWorkflowContents);
    jsYaml.load.withArgs(existingWorkflowContents).returns({on: {}, permissions: {contents: 'read'}});

    await lift({projectRoot});

    assert.calledWith(fs.rename, pathToLegacyReleaseWorkflowFile, pathToExperimentalReleaseWorkflowFile);
  });
});
