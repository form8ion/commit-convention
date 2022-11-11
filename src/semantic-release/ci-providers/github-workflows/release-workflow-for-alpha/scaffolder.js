import {fileTypes, writeConfigFile} from '@form8ion/core';

export default async function ({projectRoot}) {
  await writeConfigFile({
    format: fileTypes.YAML,
    path: `${projectRoot}/.github/workflows`,
    name: 'release',
    config: {
      name: 'Release',
      on: {push: {branches: ['alpha']}},
      jobs: {
        release: {
          uses: 'form8ion/.github/.github/workflows/release-package.yml@master',
          // eslint-disable-next-line no-template-curly-in-string
          secrets: {NPM_TOKEN: '${{ secrets.NPM_PUBLISH_TOKEN }}'}
        }
      }
    }
  });
}
