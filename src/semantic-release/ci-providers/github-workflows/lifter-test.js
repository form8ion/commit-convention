import {promises as fs} from 'fs';
import jsYaml from 'js-yaml';
import * as core from '@form8ion/core';

import any from '@travi/any';
import {assert} from 'chai';
import sinon from 'sinon';

import * as releaseTriggerNeeds from './release-trigger-needs';
import * as releaseWorkflowLifter from './release-workflow-for-alpha/lifter';
import lift from './lifter';

suite('github-workflows lifter for semantic-release', () => {
  let sandbox;
  const projectRoot = any.string();
  const workflowsDirectory = `${projectRoot}/.github/workflows`;
  const verificationWorkflowContents = any.string();
  const parsedVerificationWorkflowContents = any.simpleObject();
  const jobs = any.objectWithKeys(any.listOf(any.word), {factory: () => ({steps: any.listOf(any.simpleObject)})});
  const legacyReleaseJob = {...any.simpleObject(), steps: any.listOf(any.simpleObject)};
  const branchTriggers = any.listOf(any.word);
  const moreBranchTriggers = any.listOf(any.word);
  const neededJobsToTriggerRelease = any.listOf(any.word);
  const modernReleaseJobDefinition = {
    needs: neededJobsToTriggerRelease,
    uses: 'form8ion/.github/.github/workflows/release-package.yml@master',
    // eslint-disable-next-line no-template-curly-in-string
    secrets: {NPM_TOKEN: '${{ secrets.NPM_PUBLISH_TOKEN }}'}
  };

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(fs, 'readFile');
    sandbox.stub(jsYaml, 'load');
    sandbox.stub(core, 'writeConfigFile');
    sandbox.stub(releaseWorkflowLifter, 'default');
    sandbox.stub(releaseTriggerNeeds, 'default');

    const commonVerificationWorkflowContents = any.string();
    fs.readFile.withArgs(`${workflowsDirectory}/node-ci.yml`, 'utf-8').resolves(commonVerificationWorkflowContents);
    jsYaml.load.withArgs(commonVerificationWorkflowContents).returns({on: {push: {branches: []}}, jobs: {}});
  });

  teardown(() => sandbox.restore());

  test('that the legacy release job is replaced', async () => {
    const existingJobs = {...jobs, release: legacyReleaseJob};
    fs.readFile.withArgs(`${workflowsDirectory}/node-ci.yml`, 'utf-8').resolves(verificationWorkflowContents);
    releaseTriggerNeeds.default.withArgs(existingJobs).returns(neededJobsToTriggerRelease);
    jsYaml.load
      .withArgs(verificationWorkflowContents)
      .returns({
        ...parsedVerificationWorkflowContents,
        on: {push: {branches: [...branchTriggers, 'alpha', 'beta', ...moreBranchTriggers]}},
        jobs: existingJobs
      });

    await lift({projectRoot});

    assert.calledWith(releaseWorkflowLifter.default, {projectRoot});
    assert.calledWith(
      core.writeConfigFile,
      {
        format: core.fileTypes.YAML,
        name: 'node-ci',
        path: workflowsDirectory,
        config: {
          ...parsedVerificationWorkflowContents,
          on: {push: {branches: [...branchTriggers, 'beta', ...moreBranchTriggers]}},
          jobs: {...jobs, release: modernReleaseJobDefinition}
        }
      }
    );
  });

  test('that a modern release job is left as-is', async () => {
    const existingJobs = {...jobs, release: modernReleaseJobDefinition};
    releaseTriggerNeeds.default.withArgs(existingJobs).returns(neededJobsToTriggerRelease);
    fs.readFile.withArgs(`${workflowsDirectory}/node-ci.yml`, 'utf-8').resolves(verificationWorkflowContents);
    jsYaml.load
      .withArgs(verificationWorkflowContents)
      .returns({
        ...parsedVerificationWorkflowContents,
        on: {push: {branches: [...branchTriggers, 'beta', ...moreBranchTriggers]}},
        jobs: existingJobs
      });

    await lift({projectRoot});

    assert.calledWith(
      core.writeConfigFile,
      {
        format: core.fileTypes.YAML,
        name: 'node-ci',
        path: workflowsDirectory,
        config: {
          ...parsedVerificationWorkflowContents,
          on: {push: {branches: [...branchTriggers, 'beta', ...moreBranchTriggers]}},
          jobs: {...jobs, release: modernReleaseJobDefinition}
        }
      }
    );
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
    fs.readFile.withArgs(`${workflowsDirectory}/node-ci.yml`, 'utf-8').resolves(verificationWorkflowContents);
    releaseTriggerNeeds.default.withArgs(existingJobs).returns(neededJobsToTriggerRelease);
    jsYaml.load
      .withArgs(verificationWorkflowContents)
      .returns({
        ...parsedVerificationWorkflowContents,
        on: {push: {branches: [...branchTriggers, 'alpha', 'beta', ...moreBranchTriggers]}},
        jobs: existingJobs
      });

    await lift({projectRoot});

    assert.calledWith(
      core.writeConfigFile,
      {
        format: core.fileTypes.YAML,
        name: 'node-ci',
        path: workflowsDirectory,
        config: {
          ...parsedVerificationWorkflowContents,
          on: {push: {branches: [...branchTriggers, 'beta', ...moreBranchTriggers]}},
          jobs: {
            ...jobs,
            [jobNameContainingCycjimmyAction]: {steps: otherStepsInJobContainingCycJimmyAction},
            release: {
              needs: neededJobsToTriggerRelease,
              uses: 'form8ion/.github/.github/workflows/release-package.yml@master',
              // eslint-disable-next-line no-template-curly-in-string
              secrets: {NPM_TOKEN: '${{ secrets.NPM_PUBLISH_TOKEN }}'}
            }
          }
        }
      }
    );
  });

  test('that the the release trigger is added when no release is configured yet', async () => {
    fs.readFile.withArgs(`${workflowsDirectory}/node-ci.yml`, 'utf-8').resolves(verificationWorkflowContents);
    releaseTriggerNeeds.default.withArgs(jobs).returns(neededJobsToTriggerRelease);
    jsYaml.load
      .withArgs(verificationWorkflowContents)
      .returns({
        ...parsedVerificationWorkflowContents,
        on: {push: {branches: [...branchTriggers, ...moreBranchTriggers]}},
        jobs
      });

    await lift({projectRoot});

    assert.calledWith(
      core.writeConfigFile,
      {
        format: core.fileTypes.YAML,
        name: 'node-ci',
        path: workflowsDirectory,
        config: {
          ...parsedVerificationWorkflowContents,
          on: {push: {branches: [...branchTriggers, ...moreBranchTriggers, 'beta']}},
          jobs: {
            ...jobs,
            release: {
              needs: neededJobsToTriggerRelease,
              uses: 'form8ion/.github/.github/workflows/release-package.yml@master',
              // eslint-disable-next-line no-template-curly-in-string
              secrets: {NPM_TOKEN: '${{ secrets.NPM_PUBLISH_TOKEN }}'}
            }
          }
        }
      }
    );
  });
});
