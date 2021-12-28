import {fileExists} from '@form8ion/core';

import {Given, Then} from '@cucumber/cucumber';
import {assert} from 'chai';

Given('legacy releases are configured in a GitHub workflow', async function () {
  this.semanticReleaseGithubWorkflow = 'legacy';
});

Then('the release workflow if defined', async function () {
  assert.isTrue(await fileExists(`${process.cwd()}/.github/workflows/release.yml`));
});
