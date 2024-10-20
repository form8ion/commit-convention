import {promises as fs} from 'node:fs';
import {fileExists} from '@form8ion/core';

import {Given, Then, When} from '@cucumber/cucumber';
import {assert} from 'chai';

Given('commitlint is configured with a {string} extension', async function (configExtension) {
  this.commitlintConfigExtension = configExtension;
});

When('commitlint will be configured', async function () {
  assert.equal(
    await fs.readFile(`${this.projectRoot}/.commitlintrc.json`, 'utf-8'),
    `${JSON.stringify({extends: [this.commilintConfigName]}, null, 2)}\n`
  );
});

Then('other commitlint config formats do not exist', async function () {
  assert.isFalse(await fileExists(`${this.projectRoot}/.commitlintrc.js`));
  assert.isFalse(await fileExists(`${this.projectRoot}/.commitlintrc.cjs`));
});
