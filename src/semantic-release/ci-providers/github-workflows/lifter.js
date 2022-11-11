import {promises as fs} from 'fs';
import {load} from 'js-yaml';
import {fileTypes, writeConfigFile} from '@form8ion/core';

import determineTriggerNeedsFrom from './release-trigger-needs';
import {lift as liftReleaseWorkflow} from './release-workflow-for-alpha';

function removeCycjimmyActionFrom(otherJobs) {
  return Object.fromEntries(Object.entries(otherJobs).map(([jobName, job]) => [
    jobName,
    {
      ...job,
      ...job.steps && {steps: job.steps.filter(step => !step.uses?.includes('cycjimmy/semantic-release-action'))}
    }
  ]));
}

export default async function ({projectRoot}) {
  const workflowsDirectory = `${projectRoot}/.github/workflows`;

  await liftReleaseWorkflow({projectRoot});

  const parsedVerificationWorkflowDetails = load(await fs.readFile(`${workflowsDirectory}/node-ci.yml`, 'utf-8'));

  parsedVerificationWorkflowDetails.on.push.branches = [
    ...parsedVerificationWorkflowDetails.on.push.branches.filter(branch => 'alpha' !== branch),
    ...!parsedVerificationWorkflowDetails.on.push.branches.includes('beta') ? ['beta'] : []
  ];

  const {jobs} = parsedVerificationWorkflowDetails;

  parsedVerificationWorkflowDetails.jobs = {
    ...removeCycjimmyActionFrom(jobs),
    release: {
      needs: determineTriggerNeedsFrom(jobs),
      uses: 'form8ion/.github/.github/workflows/release-package.yml@master',
      // eslint-disable-next-line no-template-curly-in-string
      secrets: {NPM_TOKEN: '${{ secrets.NPM_PUBLISH_TOKEN }}'}
    }
  };

  await writeConfigFile({
    format: fileTypes.YAML,
    name: 'node-ci',
    path: workflowsDirectory,
    config: parsedVerificationWorkflowDetails
  });
}
