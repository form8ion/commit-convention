import {fileExists} from '@form8ion/core';

import scaffoldReleaseWorkflow from './scaffolder';

export default async function ({projectRoot}) {
  if (!await fileExists(`${projectRoot}/.github/workflows/release.yml`)) {
    await scaffoldReleaseWorkflow({projectRoot});
  }
}
