import {loadWorkflowFile, writeWorkflowFile} from '@form8ion/github-workflows-core';

import any from '@travi/any';
import {it, vi, describe, expect, beforeEach} from 'vitest';
import {when} from 'vitest-when';

import determineTriggerNeedsFrom from './release-trigger-needs.js';
import {lift as liftReleaseWorkflow} from './experimental-release-workflow/index.js';
import {determineAppropriateWorkflow} from './reusable-release-workflow.js';
import lift from './lifter.js';

vi.mock('@form8ion/github-workflows-core');
vi.mock('./release-trigger-needs.js');
vi.mock('./experimental-release-workflow/index.js');
vi.mock('./reusable-release-workflow.js');

const ciWorkflowName = 'node-ci';

describe('github-workflows lifter for semantic-release', () => {
  const projectRoot = any.string();
  const nodeVersion = any.string();
  const jobs = any.objectWithKeys(any.listOf(any.word), {factory: () => ({steps: any.listOf(any.simpleObject)})});
  const legacyReleaseJob = {...any.simpleObject(), steps: any.listOf(any.simpleObject)};
  const verificationWorkflowDetails = any.simpleObject();
  const neededJobsToTriggerRelease = any.listOf(any.word);
  const branchTriggers = any.listOf(any.word);
  const moreBranchTriggers = any.listOf(any.word);
  const reusableReleaseWorkflowReference = any.string();
  const modernReleaseJobDefinition = {
    needs: neededJobsToTriggerRelease,
    permissions: {
      contents: 'write',
      'id-token': 'write',
      issues: 'write',
      'pull-requests': 'write'
    },
    uses: reusableReleaseWorkflowReference,
    // eslint-disable-next-line no-template-curly-in-string
    secrets: {NPM_TOKEN: '${{ secrets.NPM_PUBLISH_TOKEN }}'}
  };

  beforeEach(() => {
    when(determineAppropriateWorkflow).calledWith(nodeVersion).thenReturn(reusableReleaseWorkflowReference);
  });

  it('should replace the legacy job', async () => {
    const existingJobs = {...jobs, release: legacyReleaseJob};
    when(determineTriggerNeedsFrom).calledWith(existingJobs).thenReturn(neededJobsToTriggerRelease);
    when(loadWorkflowFile)
      .calledWith({projectRoot, name: ciWorkflowName})
      .thenResolve({
        ...verificationWorkflowDetails,
        on: {push: {branches: [...branchTriggers, 'alpha', 'beta', ...moreBranchTriggers]}},
        jobs: existingJobs
      });

    await lift({projectRoot, nodeVersion});

    expect(liftReleaseWorkflow).toHaveBeenCalledWith({projectRoot, nodeVersion});
    expect(writeWorkflowFile).toHaveBeenCalledWith({
      projectRoot,
      name: ciWorkflowName,
      config: {
        ...verificationWorkflowDetails,
        on: {push: {branches: [...branchTriggers, 'beta', ...moreBranchTriggers]}},
        jobs: {...jobs, release: modernReleaseJobDefinition}
      }
    });
  });

  it('should replace the dispatch job', async () => {
    const existingJobs = {...jobs, release: legacyReleaseJob};
    when(determineTriggerNeedsFrom).calledWith(existingJobs).thenReturn(neededJobsToTriggerRelease);
    when(loadWorkflowFile)
      .calledWith({projectRoot, name: ciWorkflowName})
      .thenResolve({
        ...verificationWorkflowDetails,
        on: {push: {branches: [...branchTriggers, 'alpha', 'beta', ...moreBranchTriggers]}},
        jobs: existingJobs
      });

    await lift({projectRoot, nodeVersion});

    expect(liftReleaseWorkflow).toHaveBeenCalledWith({projectRoot, nodeVersion});
    expect(writeWorkflowFile).toHaveBeenCalledWith({
      projectRoot,
      name: ciWorkflowName,
      config: {
        ...verificationWorkflowDetails,
        on: {push: {branches: [...branchTriggers, 'beta', ...moreBranchTriggers]}},
        jobs: {...jobs, release: modernReleaseJobDefinition}
      }
    });
  });

  it('should leave a modern job as-is', async () => {
    const existingJobs = {...jobs, release: modernReleaseJobDefinition};
    when(determineTriggerNeedsFrom).calledWith(existingJobs).thenReturn(neededJobsToTriggerRelease);
    when(loadWorkflowFile)
      .calledWith({projectRoot, name: ciWorkflowName})
      .thenResolve({
        ...verificationWorkflowDetails,
        on: {push: {branches: [...branchTriggers, 'beta', ...moreBranchTriggers]}},
        jobs: existingJobs
      });

    await lift({projectRoot, nodeVersion});

    expect(writeWorkflowFile).toHaveBeenCalledWith({
      projectRoot,
      name: ciWorkflowName,
      config: {
        ...verificationWorkflowDetails,
        on: {push: {branches: [...branchTriggers, 'beta', ...moreBranchTriggers]}},
        jobs: {...jobs, release: modernReleaseJobDefinition}
      }
    });
  });

  it('should remove the cycjimmy action', async () => {
    const jobNameContainingCycjimmyAction = any.word();
    const otherStepsInJobContainingCycJimmyAction = any.listOf(any.simpleObject);
    const existingJobs = {
      ...jobs,
      [jobNameContainingCycjimmyAction]: {
        steps: [
          ...otherStepsInJobContainingCycJimmyAction,
          {uses: `cycjimmy/semantic-release-action@v${any.integer()}`}
        ]
      }
    };
    when(determineTriggerNeedsFrom).calledWith(existingJobs).thenReturn(neededJobsToTriggerRelease);
    when(loadWorkflowFile)
      .calledWith({projectRoot, name: ciWorkflowName})
      .thenResolve({
        ...verificationWorkflowDetails,
        on: {push: {branches: [...branchTriggers, 'alpha', 'beta', ...moreBranchTriggers]}},
        jobs: existingJobs
      });

    await lift({projectRoot, nodeVersion});

    expect(writeWorkflowFile).toHaveBeenCalledWith({
      projectRoot,
      name: ciWorkflowName,
      config: {
        ...verificationWorkflowDetails,
        on: {push: {branches: [...branchTriggers, 'beta', ...moreBranchTriggers]}},
        jobs: {
          ...jobs,
          [jobNameContainingCycjimmyAction]: {steps: otherStepsInJobContainingCycJimmyAction},
          release: modernReleaseJobDefinition
        }
      }
    });
  });

  it('should add the release trigger when no release is configured yet', async () => {
    when(determineTriggerNeedsFrom).calledWith(jobs).thenReturn(neededJobsToTriggerRelease);
    when(loadWorkflowFile)
      .calledWith({projectRoot, name: ciWorkflowName})
      .thenResolve({
        ...verificationWorkflowDetails,
        on: {push: {branches: [...branchTriggers, ...moreBranchTriggers]}},
        jobs
      });

    await lift({projectRoot, nodeVersion});

    expect(writeWorkflowFile).toHaveBeenCalledWith({
      projectRoot,
      name: ciWorkflowName,
      config: {
        ...verificationWorkflowDetails,
        on: {push: {branches: [...branchTriggers, ...moreBranchTriggers, 'beta']}},
        jobs: {...jobs, release: modernReleaseJobDefinition}
      }
    });
  });
});
