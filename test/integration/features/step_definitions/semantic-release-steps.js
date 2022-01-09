import {Given} from '@cucumber/cucumber';

Given('semantic-release is configured', async function () {
  this.semanticReleaseConfigured = true;
});

Given('semantic-release is not configured', async function () {
  this.semanticReleaseConfigured = false;
});
