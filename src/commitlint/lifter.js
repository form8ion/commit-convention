import {promises as fs} from 'node:fs';

import {fileExists} from '@form8ion/core';

import scaffoldCommitlint from './scaffolder.js';

export default async function ({projectRoot, configs}) {
  if (await fileExists(`${projectRoot}/.commitlintrc.js`)) {
    await fs.unlink(`${projectRoot}/.commitlintrc.js`);

    return scaffoldCommitlint({projectRoot, config: configs.commitlint});
  }

  if (await fileExists(`${projectRoot}/.commitlintrc.cjs`)) {
    await fs.unlink(`${projectRoot}/.commitlintrc.cjs`);

    return scaffoldCommitlint({projectRoot, config: configs.commitlint});
  }

  return {};
}
