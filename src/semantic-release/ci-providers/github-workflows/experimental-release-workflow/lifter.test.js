import {loadWorkflowFile, renameWorkflowFile, workflowFileExists} from '@form8ion/github-workflows-core';

import any from '@travi/any';
import {it, describe, vi, expect, beforeEach} from 'vitest';
import {when} from 'vitest-when';

import {determineAppropriateWorkflow} from '../reusable-release-workflow.js';
import scaffoldWorkflow from './scaffolder.js';
import lift from './lifter.js';

vi.mock('@form8ion/github-workflows-core');
vi.mock('../reusable-release-workflow.js');
vi.mock('./scaffolder.js');

const experimentalReleaseWorkflowName = 'experimental-release';

describe('experimental release workflow lifter', () => {
  const projectRoot = any.string();
  const nodeVersion = any.string();
  const appropriateReusableReleaseWorkflowVersion = any.string();
  const scaffoldResults = any.simpleObject();

  beforeEach(() => {
    when(scaffoldWorkflow).calledWith({projectRoot, nodeVersion}).thenResolve(scaffoldResults);
    when(determineAppropriateWorkflow)
      .calledWith(nodeVersion)
      .thenReturn(appropriateReusableReleaseWorkflowVersion);
  });

  it('should call the scaffolder when the experimental release workflow does not exist', async () => {
    when(workflowFileExists).calledWith({projectRoot, name: experimentalReleaseWorkflowName}).thenResolve(false);

    expect(await lift({projectRoot, nodeVersion})).toEqual(scaffoldResults);
    expect(renameWorkflowFile).not.toHaveBeenCalled();
  });

  it('should re-run the scaffolder when the experimental release workflow is dispatchable', async () => {
    when(workflowFileExists).calledWith({projectRoot, name: experimentalReleaseWorkflowName}).thenResolve(true);
    when(loadWorkflowFile)
      .calledWith({projectRoot, name: experimentalReleaseWorkflowName})
      .thenResolve({
        on: {workflow_dispatch: {}},
        permissions: {contents: 'read'},
        jobs: {release: {uses: appropriateReusableReleaseWorkflowVersion}}
      });

    expect(await lift({projectRoot, nodeVersion})).toEqual(scaffoldResults);
    expect(renameWorkflowFile).not.toHaveBeenCalled();
  });

  it('should re-run the scaffolder when permissions have not been restricted', async () => {
    when(workflowFileExists).calledWith({projectRoot, name: experimentalReleaseWorkflowName}).thenResolve(true);
    when(loadWorkflowFile).calledWith({projectRoot, name: experimentalReleaseWorkflowName}).thenResolve({
      on: {},
      jobs: {release: {uses: appropriateReusableReleaseWorkflowVersion}}
    });

    expect(await lift({projectRoot, nodeVersion})).toEqual(scaffoldResults);
    expect(renameWorkflowFile).not.toHaveBeenCalled();
  });

  it('should re-run the scaffolder when permissions have not been restricted enough', async () => {
    when(workflowFileExists).calledWith({projectRoot, name: experimentalReleaseWorkflowName}).thenResolve(true);
    when(loadWorkflowFile)
      .calledWith({projectRoot, name: experimentalReleaseWorkflowName})
      .thenResolve({
        on: {},
        permissions: any.simpleObject(),
        jobs: {release: {uses: appropriateReusableReleaseWorkflowVersion}}
      });

    expect(await lift({projectRoot, nodeVersion})).toEqual(scaffoldResults);
    expect(renameWorkflowFile).not.toHaveBeenCalled();
  });

  it('should re-run the scaffolder when the `contents` permission is not properly restricted', async () => {
    when(workflowFileExists).calledWith({projectRoot, name: experimentalReleaseWorkflowName}).thenResolve(true);
    when(loadWorkflowFile)
      .calledWith({projectRoot, name: experimentalReleaseWorkflowName})
      .thenResolve({
        on: {},
        permissions: {contents: 'write'},
        jobs: {release: {uses: appropriateReusableReleaseWorkflowVersion}}
      });

    expect(await lift({projectRoot, nodeVersion})).toEqual(scaffoldResults);
    expect(renameWorkflowFile).not.toHaveBeenCalled();
  });

  it('should not re-run the scaffolder when a modern experimental release workflow already exists', async () => {
    when(workflowFileExists).calledWith({projectRoot, name: experimentalReleaseWorkflowName}).thenResolve(true);
    when(loadWorkflowFile)
      .calledWith({projectRoot, name: experimentalReleaseWorkflowName})
      .thenResolve({
        on: {},
        permissions: {contents: 'read'},
        jobs: {release: {uses: appropriateReusableReleaseWorkflowVersion}}
      });

    expect(await lift({projectRoot, nodeVersion})).toBe(undefined);
    expect(renameWorkflowFile).not.toHaveBeenCalled();
  });

  it('should re-run the scaffolder when an inappropriate version of the reusable workflow is referenced', async () => {
    const inappropriateReusableReleaseWorkflowVersion = any.string();
    when(workflowFileExists).calledWith({projectRoot, name: experimentalReleaseWorkflowName}).thenResolve(true);
    when(loadWorkflowFile)
      .calledWith({projectRoot, name: experimentalReleaseWorkflowName})
      .thenResolve({
        on: {},
        permissions: {contents: 'read'},
        jobs: {release: {uses: inappropriateReusableReleaseWorkflowVersion}}
      });

    expect(await lift({projectRoot, nodeVersion})).toEqual(scaffoldResults);
    expect(renameWorkflowFile).not.toHaveBeenCalled();
  });

  it('should should rename a legacy release workflow to clarify that it is for experimental releases', async () => {
    const legacyReleaseWorkflowName = 'release';
    when(workflowFileExists).calledWith({projectRoot, name: legacyReleaseWorkflowName}).thenResolve(true);
    when(loadWorkflowFile)
      .calledWith({projectRoot, name: legacyReleaseWorkflowName})
      .thenResolve(any.simpleObject());
    when(workflowFileExists).calledWith({projectRoot, name: experimentalReleaseWorkflowName}).thenResolve(true);
    when(loadWorkflowFile)
      .calledWith({projectRoot, name: experimentalReleaseWorkflowName})
      .thenResolve({
        on: {},
        permissions: {contents: 'read'},
        jobs: {release: {uses: appropriateReusableReleaseWorkflowVersion}}
      });

    expect(await lift({projectRoot, nodeVersion})).toBe(undefined);
    expect(renameWorkflowFile).toHaveBeenCalledWith({
      projectRoot,
      oldName: legacyReleaseWorkflowName,
      newName: experimentalReleaseWorkflowName
    });
  });
});
