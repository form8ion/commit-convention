import {loadWorkflowFile, renameWorkflowFile, workflowFileExists} from '@form8ion/github-workflows-core';

import scaffoldWorkflow from './scaffolder.js';

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
  const legacyReleaseWorkflowName = 'release';

  if (await workflowFileExists({projectRoot, name: legacyReleaseWorkflowName})) {
    await renameWorkflowFile({
      projectRoot,
      oldName: legacyReleaseWorkflowName,
      newName: experimentalReleaseWorkflowName
    });
  }
}

export default async function ({projectRoot, nodeVersion}) {
  const experimentalReleaseWorkflowName = 'experimental-release';

  await renameLegacyReleaseWorkflow(projectRoot, experimentalReleaseWorkflowName);

  if (await releaseWorkflowShouldBeScaffolded({projectRoot, name: experimentalReleaseWorkflowName})) {
    return scaffoldWorkflow({projectRoot, nodeVersion});
  }

  return undefined;
}
