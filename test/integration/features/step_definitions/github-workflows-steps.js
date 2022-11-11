import {promises as fs} from 'fs';
import {fileExists} from '@form8ion/core';

import {Given, Then} from '@cucumber/cucumber';
import {assert} from 'chai';
import {load} from 'js-yaml';

Given('legacy releases are configured in a GitHub workflow', async function () {
  this.githubWorkflows = true;
  this.verificationWorkflow = true;
  this.nodeCiWithReleaseJob = true;
  this.alphaBranchTrigger = true;
  this.betaBranchTrigger = true;
});

Given('the cycjimmy action is configured in a GitHub workflow', async function () {
  this.githubWorkflows = true;
  this.verificationWorkflow = true;
  this.nodeCiWithCycjimmyAction = true;
});

Given('a local release workflow is defined', async function () {
  this.githubWorkflows = true;
  this.releaseWorkflow = true;
  this.localReleaseWorkflow = true;
});

Given('a release workflow is defined for alpha', async function () {
  this.githubWorkflows = true;
  this.releaseWorkflow = true;
  this.alphaReleaseWorkflow = true;
});

Given('the release workflow is triggered from the ci workflow', async function () {
  this.githubWorkflows = true;
  this.verificationWorkflow = true;
  this.nodeCiWithTriggerReleaseJob = true;
});

Given('the release workflow is called from the ci workflow', async function () {
  this.githubWorkflows = true;
  this.verificationWorkflow = true;
  this.nodeCiWithCallReleaseJob = true;
});

Given('no release is configured in a GitHub workflow', async function () {
  this.githubWorkflows = true;
  this.verificationWorkflow = true;
  this.nodeCiWithReleaseJob = false;
  this.nodeCiWithTriggerReleaseJob = false;
  this.alphaBranchTrigger = false;
  this.betaBranchTrigger = false;
});

Given('multiple node versions are verified', async function () {
  this.multipleNodeVersionsVerified = true;
});

Given('no GitHub workflows exist', async function () {
  this.githubWorkflows = false;
});

Then('the release workflow calls the reusable workflow for alpha branches', async function () {
  assert.isTrue(await fileExists(`${process.cwd()}/.github/workflows/release.yml`));

  const {on: triggers, jobs} = load(await fs.readFile(`${process.cwd()}/.github/workflows/release.yml`, 'utf-8'));

  assert.isUndefined(triggers.workflow_dispatch);
  assert.deepEqual(triggers.push.branches, ['alpha']);
  assert.equal(jobs.release.uses, 'form8ion/.github/.github/workflows/release-package.yml@master');
});

Then('the release workflow is not defined', async function () {
  assert.isFalse(await fileExists(`${process.cwd()}/.github/workflows/release.yml`));
});

Then('the verification workflow calls the reusable release workflow', async function () {
  const verificationWorkflowDefinition = load(await fs.readFile(
    `${process.cwd()}/.github/workflows/node-ci.yml`,
    'utf-8'
  ));
  const branchTriggers = verificationWorkflowDefinition.on.push.branches;

  assert.include(branchTriggers, 'master');
  assert.include(branchTriggers, 'beta');
  assert.include(branchTriggers, 'dependency-updater/**');

  const verificationWorkflowJobs = verificationWorkflowDefinition.jobs;
  const releaseJob = verificationWorkflowJobs.release;

  assert.deepEqual(releaseJob.needs, ['verify']);

  assert.equal(releaseJob.uses, 'form8ion/.github/.github/workflows/release-package.yml@master');
  // eslint-disable-next-line no-template-curly-in-string
  assert.equal(releaseJob.secrets.NPM_TOKEN, '${{ secrets.NPM_PUBLISH_TOKEN }}');
});

Then('the verification workflow does not trigger the release workflow', async function () {
  const verificationWorkflowDefinition = load(await fs.readFile(
    `${process.cwd()}/.github/workflows/node-ci.yml`,
    'utf-8'
  ));

  assert.isUndefined(verificationWorkflowDefinition.jobs['trigger-release']);
});

Then('the release is not called until verification completes', async function () {
  const verificationWorkflowDefinition = load(await fs.readFile(
    `${process.cwd()}/.github/workflows/node-ci.yml`,
    'utf-8'
  ));
  const triggerReleaseJob = verificationWorkflowDefinition.jobs.release;

  assert.include(triggerReleaseJob.needs, 'verify');
  if (this.multipleNodeVersionsVerified) assert.include(triggerReleaseJob.needs, 'verify-matrix');
});

Then('the cycjimmy action was removed', async function () {
  const ciWorkflow = await fs.readFile(
    `${process.cwd()}/.github/workflows/node-ci.yml`,
    'utf-8'
  );

  assert.notInclude(ciWorkflow, 'cycjimmy');
});
