import {fileTypes, writeConfigFile} from '@form8ion/core';

import {determineAppropriateWorkflow} from '../reusable-release-workflow';

export default async function ({projectRoot, nodeVersion}) {
  await writeConfigFile({
    format: fileTypes.YAML,
    path: `${projectRoot}/.github/workflows`,
    name: 'release',
    config: {
      name: 'Release',
      on: {push: {branches: ['alpha']}},
      jobs: {
        release: {
          uses: determineAppropriateWorkflow(nodeVersion),
          // eslint-disable-next-line no-template-curly-in-string
          secrets: {NPM_TOKEN: '${{ secrets.NPM_PUBLISH_TOKEN }}'}
        }
      }
    }
  });
}
