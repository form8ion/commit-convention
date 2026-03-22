import {
  loadWorkflowFile,
  writeWorkflowFile,
  workflowFileExists,
  removeActionFromJobs
} from '@form8ion/github-workflows-core';

import determineTriggerNeedsFrom from './release-trigger-needs.js';
import {lift as liftReleaseWorkflow} from './experimental-release-workflow/index.js';
import {determineAppropriateWorkflow} from './reusable-release-workflow.js';

function removeCycjimmyActionFrom(jobs) {
  return removeActionFromJobs(jobs, 'cycjimmy/semantic-release-action');
}

function addReleaseAsWorkflowResultDependency({jobs}) {
  if (!jobs['workflow-result']) return {jobsWithoutWorkflowResult: jobs};

  const {'workflow-result': workflowResultJob, ...jobsWithoutWorkflowResult} = jobs;
  const workflowResultNeeds = [workflowResultJob.needs].flat().filter(Boolean);
  const updatedWorkflowResultNeeds = [...new Set([...workflowResultNeeds, 'release'])];
  const workflowResultJobWithUpdatedNeeds = Object.fromEntries(
    Object.entries(workflowResultJob).map(
      ([property, value]) => [property, 'needs' === property ? updatedWorkflowResultNeeds : value]
    )
  );

  return {
    jobsWithoutWorkflowResult,
    workflowResultJob: workflowResultJobWithUpdatedNeeds
  };
}

export default async function liftWorkflows({projectRoot, nodeVersion}) {
  const ciWorkflowName = 'node-ci';

  await liftReleaseWorkflow({projectRoot, nodeVersion});

  if (!await workflowFileExists({projectRoot, name: ciWorkflowName})) {
    return;
  }

  const parsedVerificationWorkflowDetails = await loadWorkflowFile({projectRoot, name: ciWorkflowName});

  parsedVerificationWorkflowDetails.on.push.branches = [
    ...parsedVerificationWorkflowDetails.on.push.branches.filter(branch => 'alpha' !== branch),
    ...!parsedVerificationWorkflowDetails.on.push.branches.includes('beta') ? ['beta'] : []
  ];

  const {'trigger-release': triggerRelease, ...otherJobs} = parsedVerificationWorkflowDetails.jobs;
  const {jobsWithoutWorkflowResult, workflowResultJob} = addReleaseAsWorkflowResultDependency({
    jobs: removeCycjimmyActionFrom(otherJobs)
  });

  parsedVerificationWorkflowDetails.jobs = {
    ...jobsWithoutWorkflowResult,
    release: {
      needs: determineTriggerNeedsFrom(otherJobs),
      permissions: {
        contents: 'write',
        'id-token': 'write',
        issues: 'write',
        'pull-requests': 'write'
      },
      uses: determineAppropriateWorkflow(nodeVersion),
      // eslint-disable-next-line no-template-curly-in-string
      secrets: {NPM_TOKEN: '${{ secrets.NPM_PUBLISH_TOKEN }}'}
    },
    ...workflowResultJob && {'workflow-result': workflowResultJob}
  };

  await writeWorkflowFile({
    projectRoot,
    name: ciWorkflowName,
    config: parsedVerificationWorkflowDetails
  });
}
