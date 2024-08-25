import {resolve} from 'path';
import {dump} from 'js-yaml';

import {After, Before, Then, When} from '@cucumber/cucumber';
import stubbedFs from 'mock-fs';
import any from '@travi/any';

const stubbedNodeModules = stubbedFs.load(resolve(__dirname, '..', '..', '..', '..', 'node_modules'));

Before(function () {
  this.projectRoot = process.cwd();
  this.commilintConfigName = `@${any.word()}`;
});

After(function () {
  stubbedFs.restore();
});

When('the project is scaffolded', async function () {
  // eslint-disable-next-line import/no-extraneous-dependencies,import/no-unresolved
  const {scaffold} = require('@form8ion/commit-convention');

  stubbedFs({node_modules: stubbedNodeModules});

  await scaffold({projectRoot: this.projectRoot, configs: {commitlint: {name: this.commilintConfigName}}});
});

When('the project is lifted', async function () {
  // eslint-disable-next-line import/no-extraneous-dependencies,import/no-unresolved
  const {test, lift} = require('@form8ion/commit-convention');

  stubbedFs({
    ...this.githubWorkflows && {
      '.github': {
        workflows: {
          ...this.verificationWorkflow && {
            'node-ci.yml': dump({
              on: {
                push: {
                  branches: [
                    'master',
                    ...this.alphaBranchTrigger ? ['alpha'] : [],
                    ...this.betaBranchTrigger ? ['beta'] : [],
                    'dependency-updater/**'
                  ]
                }
              },
              jobs: {
                verify: {steps: []},
                ...this.multipleNodeVersionsVerified && {'verify-matrix': {steps: []}},
                ...this.nodeCiWithReleaseJob && {release: {steps: []}},
                ...this.nodeCiWithCycjimmyAction && {
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
                },
                ...this.nodeCiWithTriggerReleaseJob && {'trigger-release': {steps: []}},
                ...this.nodeCiWithCallReleaseJob && {
                  release: {uses: 'form8ion/.github/.github/workflows/release-package.yml@master'}
                }
              }
            })
          },
          ...this.legacyReleaseWorkflow && {
            'release.yml': dump({
              ...this.localReleaseWorkflow && {on: {push: {branches: ['alpha']}, workflow_dispatch: {}}},
              ...this.alphaReleaseWorkflow && {
                on: {push: {branches: ['alpha']}},
                jobs: {release: {uses: 'form8ion/.github/.github/workflows/release-package.yml@master'}}
              }
            })
          },
          ...this.experimentalReleaseWorkflow && {
            'experimental-release.yml': dump({
              ...this.localReleaseWorkflow && {on: {push: {branches: ['alpha']}, workflow_dispatch: {}}},
              ...this.alphaReleaseWorkflow && {
                on: {push: {branches: ['alpha']}},
                jobs: {release: {uses: 'form8ion/.github/.github/workflows/release-package.yml@master'}}
              }
            })
          }
        }
      }
    },
    node_modules: stubbedNodeModules,
    '.nvmrc': `${this.projectNodeVersion || 18}`,
    'package.json': JSON.stringify({
      ...any.simpleObject(),
      ...this.semanticReleaseConfigured && {version: '0.0.0-semantically-released'}
    })
  });

  if (await test({projectRoot: this.projectRoot})) {
    await lift({projectRoot: this.projectRoot});
  }
});

Then('no error occurs', async function () {
  return undefined;
});
