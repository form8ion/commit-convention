import {Given} from '@cucumber/cucumber';

Given('the project uses node {int}', async function (projectNodeVersion) {
  this.projectNodeVersion = projectNodeVersion;
});
