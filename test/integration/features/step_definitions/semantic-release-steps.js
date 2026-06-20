import {mergeIntoExistingPackageJson} from '@form8ion/javascript-core';

import {Given} from '@cucumber/cucumber';

Given('semantic-release is configured', async function () {
  await mergeIntoExistingPackageJson({projectRoot: this.projectRoot, config: {version: '0.0.0-semantically-released'}});
});

Given('semantic-release is not configured', async function () {
  return undefined;
});
