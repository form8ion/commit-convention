import {resolve} from 'path';

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

  stubbedFs({
    ...this.semanticReleaseGithubWorkflow && {'.github': {workflows: {}}},
    node_modules: stubbedNodeModules,
    'package.json': JSON.stringify({
      ...any.simpleObject(),
      ...this.semanticReleaseConfigured && {version: '0.0.0-semantically-released'}
    })
  });

  if (await test({projectRoot})) {
    await lift({projectRoot});
  }
});
