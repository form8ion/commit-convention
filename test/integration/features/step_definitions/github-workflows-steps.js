import {promises as fs} from 'node:fs';
import {dump, load} from 'js-yaml';
import {loadWorkflowFile, workflowFileExists, writeWorkflowFile} from '@form8ion/github-workflows-core';

import {Given, Then} from '@cucumber/cucumber';
import {assert} from 'chai';
import any from '@travi/any';

const experimentalReleaseWorkflowName = 'experimental-release';
const legacyReleaseWorkflowName = 'release';
const ciWorkflowName = 'node-ci';

async function loadReleaseWorkflowDefinition({projectRoot}) {
  assert.isTrue(
    await workflowFileExists({projectRoot, name: experimentalReleaseWorkflowName}),
    'Experimental-Release workflow is missing'
  );

  const {on: triggers, jobs} = await loadWorkflowFile({projectRoot, name: experimentalReleaseWorkflowName});

  return {triggers, jobs};
}

async function createGithubWorkflowsDirectory(projectRoot) {
  await fs.mkdir(`${projectRoot}/.github/workflows`, {recursive: true});
}

Given('legacy releases are configured in a GitHub workflow', async function () {
  await createGithubWorkflowsDirectory(this.projectRoot);
  await writeWorkflowFile({
    projectRoot: this.projectRoot,
    name: 'node-ci',
    config: {
      on: {
        push: {
          branches: [
            'master',
            'alpha',
            'beta',
            'dependency-updater/**'
          ]
        }
      },
      jobs: {
        verify: {steps: []},
        release: {steps: []}
      }
    }
  });
});

Given('the cycjimmy action is configured in a GitHub workflow', async function () {
  await createGithubWorkflowsDirectory(this.projectRoot);
  await writeWorkflowFile({
    projectRoot: this.projectRoot,
    name: 'node-ci',
    config: {
      on: {
        push: {
          branches: [
            'master',
            'dependency-updater/**'
          ]
        }
      },
      jobs: {
        verify: {steps: []},
        [any.word()]: {
          steps: [{
            name: 'semantic-release',
            uses: 'cycjimmy/semantic-release-action@v2',
            env: {
              // eslint-disable-next-line no-template-curly-in-string
              GITHUB_TOKEN: '${{ secrets.GH_TOKEN }}',
              // eslint-disable-next-line no-template-curly-in-string
              NPM_TOKEN: '${{ secrets.NPM_PUBLISH_TOKEN }}'
            }
          }]
        }
      }
    }
  });
});

Given('a local release workflow is defined', async function () {
  await createGithubWorkflowsDirectory(this.projectRoot);
  await writeWorkflowFile({
    projectRoot: this.projectRoot,
    name: 'release',
    config: {on: {push: {branches: ['alpha']}, workflow_dispatch: {}}}
  });
});

Given('an experimental release workflow is defined', async function () {
  // this.alphaReleaseWorkflow = true;
  await writeWorkflowFile({
    projectRoot: this.projectRoot,
    name: 'experimental-release',
    config: {
      on: {push: {branches: ['alpha']}},
      jobs: {release: {uses: 'form8ion/.github/.github/workflows/release-package.yml@master'}}
    }
  });
});

Given('a legacy release workflow is defined', async function () {
  // this.githubWorkflows = true;
  // this.legacyReleaseWorkflow = true;
  // this.alphaReleaseWorkflow = true;
});

Given('the release workflow is triggered from the GitHub workflow', async function () {
  await writeWorkflowFile({
    projectRoot: this.projectRoot,
    name: 'node-ci',
    config: {
      on: {
        push: {
          branches: [
            'master',
            'dependency-updater/**'
          ]
        }
      },
      jobs: {
        verify: {steps: []},
        'trigger-release': {steps: []}
      }
    }
  });
});

Given('the release workflow is called from the GitHub workflow', async function () {
  await createGithubWorkflowsDirectory(this.projectRoot);
  await writeWorkflowFile({
    projectRoot: this.projectRoot,
    name: 'node-ci',
    config: {
      on: {
        push: {
          branches: [
            'master',
            'dependency-updater/**'
          ]
        }
      },
      jobs: {
        verify: {steps: []},
        release: {uses: 'form8ion/.github/.github/workflows/release-package.yml@master'}
      }
    }
  });
});

Given('no release is configured in a GitHub workflow', async function () {
  await createGithubWorkflowsDirectory(this.projectRoot);
  await writeWorkflowFile({
    projectRoot: this.projectRoot,
    name: 'node-ci',
    config: {
      on: {
        push: {
          branches: [
            'master',
            'dependency-updater/**'
          ]
        }
      },
      jobs: {
        verify: {steps: []}
      }
    }
  });
});

Given('multiple node versions are verified', async function () {
  const nodeCiWorkflowPath = `${this.projectRoot}/.github/workflows/node-ci.yml`;

  const nodeCiContents = load(await fs.readFile(nodeCiWorkflowPath, 'utf-8'));
  await fs.writeFile(
    nodeCiWorkflowPath,
    dump({
      ...nodeCiContents,
      jobs: {
        ...nodeCiContents.jobs,
        'verify-matrix': {steps: []},
        'workflow-result': {...any.simpleObject(), needs: ['verify', 'release', 'release']}
      }
    })
  );
});

Given('no GitHub workflows exist', async function () {
  return undefined;
});

Given('no conventional verification workflow is defined', async function () {
  return undefined;
});

Given('the workflow-result job does not yet depend on the release job', async function () {
  const nodeCiWorkflowPath = `${this.projectRoot}/.github/workflows/node-ci.yml`;

  const nodeCiContents = load(await fs.readFile(nodeCiWorkflowPath, 'utf-8'));
  await fs.writeFile(
    nodeCiWorkflowPath,
    dump({
      ...nodeCiContents,
      jobs: {...nodeCiContents.jobs, 'workflow-result': {...any.simpleObject(), needs: ['verify']}}
    })
  );
});

Given('the workflow-result job already depends on the release job', async function () {
  const nodeCiWorkflowPath = `${this.projectRoot}/.github/workflows/node-ci.yml`;

  const nodeCiContents = load(await fs.readFile(nodeCiWorkflowPath, 'utf-8'));
  await fs.writeFile(
    nodeCiWorkflowPath,
    dump({
      ...nodeCiContents,
      jobs: {
        ...nodeCiContents.jobs,
        'workflow-result': {...any.simpleObject(), needs: ['verify', 'release', 'release']}
      }
    })
  );
});

Then('the experimental release workflow calls the reusable workflow for alpha branches', async function () {
  const {triggers, jobs} = await loadReleaseWorkflowDefinition({projectRoot: this.projectRoot});

  assert.isUndefined(triggers.workflow_dispatch);
  assert.deepEqual(triggers.push.branches, ['alpha']);
  assert.equal(jobs.release.uses, 'form8ion/semantic-release-workflow/.github/workflows/release.yml@v2.0.0');
});

Then('the legacy experimental release workflow has been renamed', async function () {
  assert.isFalse(await workflowFileExists({projectRoot: this.projectRoot, name: legacyReleaseWorkflowName}));
});

Then(
  'the experimental release workflow calls the reusable workflow for semantic-release v19 for alpha branches',
  async function () {
    const {triggers, jobs} = await loadReleaseWorkflowDefinition({projectRoot: this.projectRoot});

    assert.isUndefined(triggers.workflow_dispatch);
    assert.deepEqual(triggers.push.branches, ['alpha']);
    assert.equal(
      jobs.release.uses,
      'form8ion/.github/.github/workflows/release-package-semantic-release-19.yml@master'
    );
  }
);

Then('the release workflow is not defined', async function () {
  assert.isFalse(await workflowFileExists({projectRoot: this.projectRoot, name: experimentalReleaseWorkflowName}));
});

Then('the verification workflow calls the reusable release workflow', async function () {
  const verificationWorkflowDefinition = await loadWorkflowFile({projectRoot: this.projectRoot, name: ciWorkflowName});
  const branchTriggers = verificationWorkflowDefinition.on.push.branches;

  assert.include(branchTriggers, 'master');
  assert.include(branchTriggers, 'beta');
  assert.include(branchTriggers, 'dependency-updater/**');

  const verificationWorkflowJobs = verificationWorkflowDefinition.jobs;

  assert.notInclude(Object.keys(verificationWorkflowJobs), 'trigger-release');

  const releaseJob = verificationWorkflowJobs.release;

  assert.deepEqual(releaseJob.needs, ['verify']);
  assert.deepEqual(
    releaseJob.permissions,
    {
      contents: 'write',
      'id-token': 'write',
      issues: 'write',
      'pull-requests': 'write'
    }
  );

  assert.equal(releaseJob.uses, 'form8ion/semantic-release-workflow/.github/workflows/release.yml@v2.0.0');
  // eslint-disable-next-line no-template-curly-in-string
  assert.equal(releaseJob.secrets.NPM_TOKEN, '${{ secrets.NPM_PUBLISH_TOKEN }}');
});

Then('the verification workflow calls the reusable release workflow for semantic-release v19', async function () {
  const verificationWorkflowDefinition = await loadWorkflowFile({projectRoot: this.projectRoot, name: ciWorkflowName});
  const branchTriggers = verificationWorkflowDefinition.on.push.branches;

  assert.include(branchTriggers, 'master');
  assert.include(branchTriggers, 'beta');
  assert.include(branchTriggers, 'dependency-updater/**');

  const verificationWorkflowJobs = verificationWorkflowDefinition.jobs;

  assert.notInclude(Object.keys(verificationWorkflowJobs), 'trigger-release');

  const releaseJob = verificationWorkflowJobs.release;

  assert.deepEqual(releaseJob.needs, ['verify']);

  assert.equal(releaseJob.uses, 'form8ion/.github/.github/workflows/release-package-semantic-release-19.yml@master');
  // eslint-disable-next-line no-template-curly-in-string
  assert.equal(releaseJob.secrets.NPM_TOKEN, '${{ secrets.NPM_PUBLISH_TOKEN }}');
});

Then('the verification workflow does not trigger the release workflow', async function () {
  const verificationWorkflowDefinition = await loadWorkflowFile({projectRoot: this.projectRoot, name: ciWorkflowName});

  assert.isUndefined(verificationWorkflowDefinition.jobs['trigger-release']);
});

Then('the release is not called until verification completes', async function () {
  const verificationWorkflowDefinition = await loadWorkflowFile({projectRoot: this.projectRoot, name: ciWorkflowName});
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

Then('the workflow-result job depends on the release job', async function () {
  const verificationWorkflowDefinition = await loadWorkflowFile({projectRoot: this.projectRoot, name: ciWorkflowName});

  assert.include(verificationWorkflowDefinition.jobs['workflow-result'].needs, 'release');
});

Then('the workflow-result job depends on the release job only once', async function () {
  const verificationWorkflowDefinition = await loadWorkflowFile({projectRoot: this.projectRoot, name: ciWorkflowName});
  const releaseDependencies = verificationWorkflowDefinition.jobs['workflow-result'].needs
    .filter(jobName => 'release' === jobName);

  assert.lengthOf(releaseDependencies, 1);
});
