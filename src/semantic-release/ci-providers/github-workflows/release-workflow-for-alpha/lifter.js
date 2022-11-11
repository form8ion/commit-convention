import {promises as fs} from 'fs';
import {load} from 'js-yaml';
import {fileExists} from '@form8ion/core';

import scaffolder from './scaffolder';

async function releaseWorkflowShouldBeScaffolded(pathToReleaseWorkflowFile) {
  return !await fileExists(pathToReleaseWorkflowFile)
    || load(await fs.readFile(pathToReleaseWorkflowFile, 'utf-8')).on.workflow_dispatch;
}

export default async function ({projectRoot}) {
  const workflowsDirectory = `${projectRoot}/.github/workflows`;
  const pathToReleaseWorkflowFile = `${workflowsDirectory}/release.yml`;

  if (await releaseWorkflowShouldBeScaffolded(pathToReleaseWorkflowFile)) {
    return scaffolder({projectRoot});
  }

  return undefined;
}
