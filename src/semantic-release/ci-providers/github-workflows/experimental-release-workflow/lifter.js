import {promises as fs} from 'fs';
import {load} from 'js-yaml';
import {fileExists} from '@form8ion/core';

import scaffolder from './scaffolder.js';

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
  const pathToExperimentalReleaseWorkflowFile = `${workflowsDirectory}/experimental-release.yml`;
  const pathToLegacyReleaseWorkflowFile = `${workflowsDirectory}/release.yml`;

  if (await fileExists(pathToLegacyReleaseWorkflowFile)) {
    await fs.rename(pathToLegacyReleaseWorkflowFile, pathToExperimentalReleaseWorkflowFile);
  }

  if (await releaseWorkflowShouldBeScaffolded(pathToExperimentalReleaseWorkflowFile)) {
    return scaffolder({projectRoot, nodeVersion});
  }

  return undefined;
}
