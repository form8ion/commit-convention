import {promises as fs} from 'fs';
import {load} from 'js-yaml';
import {fileExists} from '@form8ion/core';

import scaffolder from './scaffolder';

function workflowPermissionsAreMinimal(existingContents) {
  return existingContents.permissions
    && existingContents.permissions.contents
    && 'read' === existingContents.permissions.contents;
}

async function contentsNeedToBeUpdated(pathToReleaseWorkflowFile) {
  const existingContents = load(await fs.readFile(pathToReleaseWorkflowFile, 'utf-8'));

  return existingContents.on.workflow_dispatch || !workflowPermissionsAreMinimal(existingContents);
}

async function releaseWorkflowShouldBeScaffolded(pathToReleaseWorkflowFile) {
  return !await fileExists(pathToReleaseWorkflowFile) || contentsNeedToBeUpdated(pathToReleaseWorkflowFile);
}

export default async function ({projectRoot, nodeVersion}) {
  const workflowsDirectory = `${projectRoot}/.github/workflows`;
  const pathToReleaseWorkflowFile = `${workflowsDirectory}/release.yml`;

  if (await releaseWorkflowShouldBeScaffolded(pathToReleaseWorkflowFile)) {
    return scaffolder({projectRoot, nodeVersion});
  }

  return undefined;
}
