import {resolve} from 'path';
import {dump} from 'js-yaml';

import {After, When} from '@cucumber/cucumber';
import stubbedFs from 'mock-fs';
import any from '@travi/any';

const stubbedNodeModules = stubbedFs.load(resolve(__dirname, '..', '..', '..', '..', 'node_modules'));
const projectRoot = process.cwd();

After(function () {
  stubbedFs.restore();
});

When('the project is scaffolded', async function () {
  // eslint-disable-next-line import/no-extraneous-dependencies,import/no-unresolved
  const {scaffold} = require('@form8ion/commit-convention');

  stubbedFs({
    node_modules: stubbedNodeModules
  });

  await scaffold({projectRoot, configs: {}});
});

When('the project is lifted', async function () {
  // eslint-disable-next-line import/no-extraneous-dependencies,import/no-unresolved
  const {test, lift} = require('@form8ion/commit-convention');

  this.projectName = any.word();
  this.vcsOwner = any.word();

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
                verify: {},
                ...this.nodeCiWithReleaseJob && {
                  release: {}
                },
                ...this.nodeCiWithTriggerReleaseJob && {
                  'trigger-release': {}
                }
              }
            })
          },
          ...this.releaseWorkflow && {
            'release.yml': dump({})
          }
        }
      }
    },
    node_modules: stubbedNodeModules,
    'package.json': JSON.stringify({
      ...any.simpleObject(),
      ...this.semanticReleaseConfigured && {version: '0.0.0-semantically-released'}
    })
  });

  if (await test({projectRoot})) {
    await lift({projectRoot, vcs: {owner: this.vcsOwner, name: this.projectName}});
  }
});
