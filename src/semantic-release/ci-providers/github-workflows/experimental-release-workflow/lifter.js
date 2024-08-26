import {promises as fs} from 'fs';
import {loadWorkflowFile, workflowFileExists} from '@form8ion/github-workflows-core';

import scaffolder from './scaffolder.js';

function workflowPermissionsAreMinimal(existingContents) {
  return existingContents.permissions
    && existingContents.permissions.contents
    && 'read' === existingContents.permissions.contents;
}

async function contentsNeedToBeUpdated({projectRoot, name}) {
  const existingContents = await loadWorkflowFile({projectRoot, name});

  return existingContents.on.workflow_dispatch || !workflowPermissionsAreMinimal(existingContents);
}

async function releaseWorkflowShouldBeScaffolded({projectRoot, name}) {
  return !await workflowFileExists({projectRoot, name}) || contentsNeedToBeUpdated({projectRoot, name});
}

async function renameLegacyReleaseWorkflow(projectRoot, experimentalReleaseWorkflowName) {
  const workflowsDirectory = `${projectRoot}/.github/workflows`;
  const legacyReleaseWorkflowName = 'release';

  if (await workflowFileExists({projectRoot, name: legacyReleaseWorkflowName})) {
    await fs.rename(
      `${workflowsDirectory}/${legacyReleaseWorkflowName}.yml`,
      `${workflowsDirectory}/${experimentalReleaseWorkflowName}.yml`
    );
  }
}

export default async function ({projectRoot, nodeVersion}) {
  const experimentalReleaseWorkflowName = 'experimental-release';

  await renameLegacyReleaseWorkflow(projectRoot, experimentalReleaseWorkflowName);

  if (await releaseWorkflowShouldBeScaffolded({projectRoot, name: experimentalReleaseWorkflowName})) {
    return scaffolder({projectRoot, nodeVersion});
  }

  return undefined;
}
