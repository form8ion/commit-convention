import {promises as fs} from 'node:fs';

import {Given} from '@cucumber/cucumber';

Given('the project uses node {int}', async function (projectNodeVersion) {
  await fs.writeFile(`${this.projectRoot}/.nvmrc`, projectNodeVersion.toString());
});
