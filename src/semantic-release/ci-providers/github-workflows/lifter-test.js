import {promises as fs} from 'fs';
import jsYaml from 'js-yaml';
import * as core from '@form8ion/core';

import any from '@travi/any';
import {assert} from 'chai';
import sinon from 'sinon';

import * as releaseTriggerNeeds from './release-trigger-needs';
import * as scaffolder from './scaffolder';
import lift from './lifter';

suite('github-workflows lifter for semantic-release', () => {
  let sandbox;
  const projectRoot = any.string();
  const workflowsDirectory = `${projectRoot}/.github/workflows`;
  const vcsName = any.word();
  const vcsOwner = any.word();
  const vcsDetails = {name: vcsName, owner: vcsOwner};
  const verificationWorkflowContents = any.string();
  const parsedVerificationWorkflowContents = any.simpleObject();
  const jobs = any.objectWithKeys(any.listOf(any.word), {factory: () => ({steps: any.listOf(any.simpleObject)})});
  const legacyReleaseJob = any.simpleObject();
  const updatedVerificationWorkflowContents = any.string();
  const branchTriggers = any.listOf(any.word);
  const moreBranchTriggers = any.listOf(any.word);
  const neededJobsToTriggerRelease = any.listOf(any.word);

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(fs, 'readFile');
    sandbox.stub(fs, 'writeFile');
    sandbox.stub(jsYaml, 'load');
    sandbox.stub(jsYaml, 'dump');
    sandbox.stub(core, 'fileExists');
    sandbox.stub(scaffolder, 'default');
    sandbox.stub(releaseTriggerNeeds, 'default');

    const commonVerificationWorkflowContents = any.string();
    fs.readFile.withArgs(`${workflowsDirectory}/node-ci.yml`, 'utf-8').resolves(commonVerificationWorkflowContents);
    jsYaml.load.withArgs(commonVerificationWorkflowContents).returns({on: {push: {branches: []}}, jobs: {}});
  });

  teardown(() => sandbox.restore());

  test('that the release workflow is added if it doesnt already exist', async () => {
    core.fileExists.resolves(false);

    await lift({projectRoot, vcs: vcsDetails});

    assert.calledWith(scaffolder.default, {projectRoot});
  });

  test('that the release workflow is not added if it already exists', async () => {
    core.fileExists.withArgs(`${workflowsDirectory}/release.yml`).resolves(true);

    await lift({projectRoot, vcs: vcsDetails});

    assert.notCalled(scaffolder.default);
  });

  test('that the legacy release job is removed', async () => {
    const existingJobs = {...jobs, release: legacyReleaseJob};
    core.fileExists.resolves(true);
    fs.readFile.withArgs(`${workflowsDirectory}/node-ci.yml`, 'utf-8').resolves(verificationWorkflowContents);
    releaseTriggerNeeds.default.withArgs(existingJobs).returns(neededJobsToTriggerRelease);
    jsYaml.load
      .withArgs(verificationWorkflowContents)
      .returns({
        ...parsedVerificationWorkflowContents,
        on: {push: {branches: [...branchTriggers, 'alpha', 'beta', ...moreBranchTriggers]}},
        jobs: existingJobs
      });
    jsYaml.dump
      .withArgs({
        ...parsedVerificationWorkflowContents,
        on: {push: {branches: [...branchTriggers, 'beta', ...moreBranchTriggers]}},
        jobs: {
          ...jobs,
          'trigger-release': {
            'runs-on': 'ubuntu-latest',
            if: "github.event_name == 'push'",
            needs: neededJobsToTriggerRelease,
            steps: [{
              uses: 'octokit/request-action@v2.x',
              with: {
                route: 'POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches',
                owner: vcsOwner,
                repo: vcsName,
                ref: '${{ github.ref }}',                       // eslint-disable-line no-template-curly-in-string
                workflow_id: 'release.yml'
              },
              env: {
                GITHUB_TOKEN: '${{ secrets.GH_PAT }}'         // eslint-disable-line no-template-curly-in-string
              }
            }]
          }
        }
      })
      .returns(updatedVerificationWorkflowContents);

    await lift({projectRoot, vcs: vcsDetails});

    assert.calledWith(fs.writeFile, `${workflowsDirectory}/node-ci.yml`, updatedVerificationWorkflowContents);
  });

  test('that the cycjimmy action is removed', async () => {
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
    core.fileExists.resolves(true);
    fs.readFile.withArgs(`${workflowsDirectory}/node-ci.yml`, 'utf-8').resolves(verificationWorkflowContents);
    releaseTriggerNeeds.default.withArgs(existingJobs).returns(neededJobsToTriggerRelease);
    jsYaml.load
      .withArgs(verificationWorkflowContents)
      .returns({
        ...parsedVerificationWorkflowContents,
        on: {push: {branches: [...branchTriggers, 'alpha', 'beta', ...moreBranchTriggers]}},
        jobs: existingJobs
      });
    jsYaml.dump
      .withArgs({
        ...parsedVerificationWorkflowContents,
        on: {push: {branches: [...branchTriggers, 'beta', ...moreBranchTriggers]}},
        jobs: {
          ...jobs,
          [jobNameContainingCycjimmyAction]: {steps: otherStepsInJobContainingCycJimmyAction},
          'trigger-release': {
            'runs-on': 'ubuntu-latest',
            if: "github.event_name == 'push'",
            needs: neededJobsToTriggerRelease,
            steps: [{
              uses: 'octokit/request-action@v2.x',
              with: {
                route: 'POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches',
                owner: vcsOwner,
                repo: vcsName,
                ref: '${{ github.ref }}',                       // eslint-disable-line no-template-curly-in-string
                workflow_id: 'release.yml'
              },
              env: {
                GITHUB_TOKEN: '${{ secrets.GH_PAT }}'         // eslint-disable-line no-template-curly-in-string
              }
            }]
          }
        }
      })
      .returns(updatedVerificationWorkflowContents);

    await lift({projectRoot, vcs: vcsDetails});

    assert.calledWith(fs.writeFile, `${workflowsDirectory}/node-ci.yml`, updatedVerificationWorkflowContents);
  });

  test('that the the release trigger is added when no release is configured yet', async () => {
    core.fileExists.resolves(true);
    fs.readFile.withArgs(`${workflowsDirectory}/node-ci.yml`, 'utf-8').resolves(verificationWorkflowContents);
    releaseTriggerNeeds.default.withArgs(jobs).returns(neededJobsToTriggerRelease);
    jsYaml.load
      .withArgs(verificationWorkflowContents)
      .returns({
        ...parsedVerificationWorkflowContents,
        on: {push: {branches: [...branchTriggers, ...moreBranchTriggers]}},
        jobs
      });
    jsYaml.dump
      .withArgs({
        ...parsedVerificationWorkflowContents,
        on: {push: {branches: [...branchTriggers, ...moreBranchTriggers, 'beta']}},
        jobs: {
          ...jobs,
          'trigger-release': {
            'runs-on': 'ubuntu-latest',
            if: "github.event_name == 'push'",
            needs: neededJobsToTriggerRelease,
            steps: [{
              uses: 'octokit/request-action@v2.x',
              with: {
                route: 'POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches',
                owner: vcsOwner,
                repo: vcsName,
                ref: '${{ github.ref }}',                       // eslint-disable-line no-template-curly-in-string
                workflow_id: 'release.yml'
              },
              env: {
                GITHUB_TOKEN: '${{ secrets.GH_PAT }}'         // eslint-disable-line no-template-curly-in-string
              }
            }]
          }
        }
      })
      .returns(updatedVerificationWorkflowContents);

    await lift({projectRoot, vcs: vcsDetails});

    assert.calledWith(fs.writeFile, `${workflowsDirectory}/node-ci.yml`, updatedVerificationWorkflowContents);
  });
});
