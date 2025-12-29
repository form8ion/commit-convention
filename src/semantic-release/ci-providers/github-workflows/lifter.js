import {loadWorkflowFile, writeWorkflowFile, workflowFileExists} from '@form8ion/github-workflows-core';

import determineTriggerNeedsFrom from './release-trigger-needs.js';
import {lift as liftReleaseWorkflow} from './experimental-release-workflow/index.js';
import {determineAppropriateWorkflow} from './reusable-release-workflow.js';

function removeCycjimmyActionFrom(otherJobs) {
  return Object.fromEntries(Object.entries(otherJobs).map(([jobName, job]) => [
    jobName,
    {
      ...job,
      ...job.steps && {steps: job.steps.filter(step => !step.uses?.includes('cycjimmy/semantic-release-action'))}
    }
  ]));
}

export default async function ({projectRoot, nodeVersion}) {
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

  parsedVerificationWorkflowDetails.jobs = {
    ...removeCycjimmyActionFrom(otherJobs),
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
    }
  };

  await writeWorkflowFile({
    projectRoot,
    name: ciWorkflowName,
    config: parsedVerificationWorkflowDetails
  });
}
