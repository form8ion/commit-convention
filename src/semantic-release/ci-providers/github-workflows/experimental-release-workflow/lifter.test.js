import {loadWorkflowFile, renameWorkflowFile, workflowFileExists} from '@form8ion/github-workflows-core';

import any from '@travi/any';
import {it, describe, vi, expect, beforeEach} from 'vitest';
import {when} from 'jest-when';

import scaffoldWorkflow from './scaffolder.js';
import lift from './lifter.js';

vi.mock('@form8ion/github-workflows-core');
vi.mock('./scaffolder.js');

const experimentalReleaseWorkflowName = 'experimental-release';

describe('experimental release workflow lifter', () => {
  const projectRoot = any.string();
  const nodeVersion = any.string();
  const scaffoldResults = any.simpleObject();

  beforeEach(() => {
    when(scaffoldWorkflow).calledWith({projectRoot, nodeVersion}).mockResolvedValue(scaffoldResults);
  });

  it('should call the scaffolder when the experimental release workflow does not exist', async () => {
    when(workflowFileExists).calledWith({projectRoot, name: experimentalReleaseWorkflowName}).mockResolvedValue(false);

    expect(await lift({projectRoot, nodeVersion})).toEqual(scaffoldResults);
    expect(renameWorkflowFile).not.toHaveBeenCalled();
  });

  it('should re-run the scaffolder when the experimental release workflow is dispatchable', async () => {
    when(workflowFileExists).calledWith({projectRoot, name: experimentalReleaseWorkflowName}).mockResolvedValue(true);
    when(loadWorkflowFile)
      .calledWith({projectRoot, name: experimentalReleaseWorkflowName})
      .mockResolvedValue({on: {workflow_dispatch: {}}, permissions: {contents: 'read'}});

    expect(await lift({projectRoot, nodeVersion})).toEqual(scaffoldResults);
    expect(renameWorkflowFile).not.toHaveBeenCalled();
  });

  it('should re-run the scaffolder when permissions have not been restricted', async () => {
    when(workflowFileExists).calledWith({projectRoot, name: experimentalReleaseWorkflowName}).mockResolvedValue(true);
    when(loadWorkflowFile).calledWith({projectRoot, name: experimentalReleaseWorkflowName}).mockResolvedValue({on: {}});

    expect(await lift({projectRoot, nodeVersion})).toEqual(scaffoldResults);
    expect(renameWorkflowFile).not.toHaveBeenCalled();
  });

  it('should re-run the scaffolder when permissions have not been restricted enough', async () => {
    when(workflowFileExists).calledWith({projectRoot, name: experimentalReleaseWorkflowName}).mockResolvedValue(true);
    when(loadWorkflowFile)
      .calledWith({projectRoot, name: experimentalReleaseWorkflowName})
      .mockResolvedValue({on: {}, permissions: any.simpleObject()});

    expect(await lift({projectRoot, nodeVersion})).toEqual(scaffoldResults);
    expect(renameWorkflowFile).not.toHaveBeenCalled();
  });

  it('should re-run the scaffolder when the `contents` permission is not properly restricted', async () => {
    when(workflowFileExists).calledWith({projectRoot, name: experimentalReleaseWorkflowName}).mockResolvedValue(true);
    when(loadWorkflowFile)
      .calledWith({projectRoot, name: experimentalReleaseWorkflowName})
      .mockResolvedValue({on: {}, permissions: {contents: 'write'}});

    expect(await lift({projectRoot, nodeVersion})).toEqual(scaffoldResults);
    expect(renameWorkflowFile).not.toHaveBeenCalled();
  });

  it('should not re-run the scaffolder when a modern experimental release workflow already exists', async () => {
    when(workflowFileExists).calledWith({projectRoot, name: experimentalReleaseWorkflowName}).mockResolvedValue(true);
    when(loadWorkflowFile)
      .calledWith({projectRoot, name: experimentalReleaseWorkflowName})
      .mockResolvedValue({on: {}, permissions: {contents: 'read'}});

    expect(await lift({projectRoot, nodeVersion})).toBe(undefined);
    expect(renameWorkflowFile).not.toHaveBeenCalled();
  });

  it('should should rename a legacy release workflow to clarify that it is for experimental releases', async () => {
    const legacyReleaseWorkflowName = 'release';
    when(workflowFileExists).calledWith({projectRoot, name: legacyReleaseWorkflowName}).mockResolvedValue(true);
    when(loadWorkflowFile)
      .calledWith({projectRoot, name: legacyReleaseWorkflowName})
      .mockResolvedValue({on: {}, permissions: {contents: 'read'}});

    expect(await lift({projectRoot, nodeVersion})).toBe(undefined);
    expect(renameWorkflowFile).toHaveBeenCalledWith({
      projectRoot,
      oldName: legacyReleaseWorkflowName,
      newName: experimentalReleaseWorkflowName
    });
  });
});
