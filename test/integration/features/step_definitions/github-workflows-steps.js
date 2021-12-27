import {Given} from '@cucumber/cucumber';

Given('legacy releases are configured in a GitHub workflow', async function () {
  this.semanticReleaseGithubWorkflow = 'legacy';
});
