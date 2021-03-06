import {fileTypes, writeConfigFile} from '@form8ion/core';
import {
  scaffoldCheckoutStep,
  scaffoldNodeSetupStep,
  scaffoldDependencyInstallationStep
} from '@form8ion/github-workflows-core';

export default async function ({projectRoot}) {
  await writeConfigFile({
    format: fileTypes.YAML,
    path: `${projectRoot}/.github/workflows`,
    name: 'release',
    config: {
      name: 'Release',
      on: {push: {branches: ['alpha']}, workflow_dispatch: {}},
      env: {FORCE_COLOR: 1, NPM_CONFIG_COLOR: 'always'},
      jobs: {
        release: {
          'runs-on': 'ubuntu-latest',
          steps: [
            scaffoldCheckoutStep(),
            scaffoldNodeSetupStep({versionDeterminedBy: 'nvmrc'}),
            scaffoldDependencyInstallationStep(),
            {
              name: 'semantic-release',
              run: 'npx semantic-release',
              env: {
                GITHUB_TOKEN: '${{ secrets.GITHUB_TOKEN }}',        // eslint-disable-line no-template-curly-in-string
                NPM_TOKEN: '${{ secrets.NPM_PUBLISH_TOKEN }}'       // eslint-disable-line no-template-curly-in-string
              }
            }
          ]
        }
      }
    }
  });
}
