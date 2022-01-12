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

Given('modern releases are configured in a GitHub workflow', async function () {
  this.githubWorkflows = true;
  this.verificationWorkflow = true;
  this.releaseWorkflow = true;
  this.nodeCiWithTriggerReleaseJob = true;
});

Given('no release is configured in a GitHub workflow', async function () {
  this.githubWorkflows = true;
  this.verificationWorkflow = true;
  this.nodeCiWithReleaseJob = false;
  this.nodeCiWithTriggerReleaseJob = false;
  this.alphaBranchTrigger = false;
  this.betaBranchTrigger = false;
});

Given('no GitHub workflows exist', async function () {
  this.githubWorkflows = false;
});

Then('the release workflow is defined', async function () {
  assert.isTrue(await fileExists(`${process.cwd()}/.github/workflows/release.yml`));
});

Then('the release workflow is not defined', async function () {
  assert.isFalse(await fileExists(`${process.cwd()}/.github/workflows/release.yml`));
});

Then('the verification workflow triggers the release workflow', async function () {
  const verificationWorkflowDefinition = load(await fs.readFile(
    `${process.cwd()}/.github/workflows/node-ci.yml`,
    'utf-8'
  ));
  const branchTriggers = verificationWorkflowDefinition.on.push.branches;

  assert.include(branchTriggers, 'master');
  assert.include(branchTriggers, 'beta');
  assert.include(branchTriggers, 'dependency-updater/**');

  const verificationWorkflowJobs = verificationWorkflowDefinition.jobs;
  const triggerReleaseJob = verificationWorkflowJobs['trigger-release'];

  assert.isUndefined(verificationWorkflowJobs.release);
  assert.equal(triggerReleaseJob.if, "github.event_name == 'push'");

  const releaseTriggerRequest = triggerReleaseJob.steps[0];
  assert.equal(releaseTriggerRequest.uses, 'octokit/request-action@v2.x');
  assert.equal(
    releaseTriggerRequest.with.route,
    'POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches'
  );
  assert.equal(releaseTriggerRequest.with.owner, this.vcsOwner);
  assert.equal(releaseTriggerRequest.with.repo, this.projectName);
});

Then('the verification workflow does not trigger the release workflow', async function () {
  const verificationWorkflowDefinition = load(await fs.readFile(
    `${process.cwd()}/.github/workflows/node-ci.yml`,
    'utf-8'
  ));

  assert.isUndefined(verificationWorkflowDefinition.jobs['trigger-release']);
});
