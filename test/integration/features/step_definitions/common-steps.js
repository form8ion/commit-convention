import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import createDebugFor from 'debug';

// eslint-disable-next-line import/no-extraneous-dependencies,import/no-unresolved
import {scaffold, lift, test} from '@form8ion/commit-convention';

import {After, Before, Then, When} from '@cucumber/cucumber';
import stubbedFs from 'mock-fs';
import any from '@travi/any';

const __dirname = dirname(fileURLToPath(import.meta.url));          // eslint-disable-line no-underscore-dangle
const stubbedNodeModules = stubbedFs.load(resolve(__dirname, '..', '..', '..', '..', 'node_modules'));
const debug = createDebugFor('test:common-steps');
const logger = {
  success: debug,
  info: debug,
  warn: debug,
  error: debug
};

Before(function () {
  this.projectRoot = process.cwd();
  this.commilintConfigName = `@${any.word()}`;

  stubbedFs({
    node_modules: stubbedNodeModules,
    'package.json': JSON.stringify({...any.simpleObject()}),
    '.nvmrc': '20'
  });
});

After(function () {
  stubbedFs.restore();
});

When('the project is scaffolded', async function () {
  await scaffold({projectRoot: this.projectRoot, configs: {commitlint: {name: this.commilintConfigName}}});
});

When('the project is lifted', async function () {
  if (await test({projectRoot: this.projectRoot})) {
    await lift(
      {projectRoot: this.projectRoot, configs: {commitlint: {name: this.commilintConfigName}}},
      {logger}
    );
  }
});

Then('no error occurs', async function () {
  return undefined;
});
