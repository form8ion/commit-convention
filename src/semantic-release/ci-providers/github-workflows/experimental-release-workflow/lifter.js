import {loadWorkflowFile, renameWorkflowFile, workflowFileExists} from '@form8ion/github-workflows-core';

import {determineAppropriateWorkflow} from '../reusable-release-workflow.js';
import scaffoldWorkflow from './scaffolder.js';

function workflowPermissionsAreMinimal(existingContents) {
  return existingContents.permissions
    && existingContents.permissions.contents
    && 'read' === existingContents.permissions.contents;
}

function reusableWorkflowVersionAppropriateForNodeVersion({nodeVersion, reusableWorkflow}) {
  return reusableWorkflow === determineAppropriateWorkflow(nodeVersion);
}

async function contentsNeedToBeUpdated({projectRoot, name, nodeVersion}) {
  const existingContents = await loadWorkflowFile({projectRoot, name});

  return existingContents.on.workflow_dispatch
    || !workflowPermissionsAreMinimal(existingContents)
    || !reusableWorkflowVersionAppropriateForNodeVersion({
      nodeVersion,
      reusableWorkflow: existingContents.jobs.release.uses
    });
}

async function releaseWorkflowShouldBeScaffolded({projectRoot, name, nodeVersion}) {
  return !await workflowFileExists({projectRoot, name}) || contentsNeedToBeUpdated({projectRoot, name, nodeVersion});
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

  if (await releaseWorkflowShouldBeScaffolded({projectRoot, name: experimentalReleaseWorkflowName, nodeVersion})) {
    return scaffoldWorkflow({projectRoot, nodeVersion});
  }

  return undefined;
}
