import {promises as fs} from 'node:fs';

import {When} from '@cucumber/cucumber';
import {assert} from 'chai';

When('commitlint will be configured', async function () {
  assert.equal(
    await fs.readFile(`${this.projectRoot}/.commitlintrc.json`, 'utf-8'),
    JSON.stringify({extends: [this.commilintConfigName]}, null, 2)
  );
});
