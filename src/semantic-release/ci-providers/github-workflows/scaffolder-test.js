import {promises as fs} from 'fs';
import jsYaml from 'js-yaml';

import {assert} from 'chai';
import sinon from 'sinon';
import any from '@travi/any';

import scaffoldReleaseWorkflow from './scaffolder';

suite('github release workflow scaffolder', () => {
  let sandbox;

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(fs, 'writeFile');
    sandbox.stub(jsYaml, 'dump');
  });

  teardown(() => sandbox.restore());

  test('that release workflow is defined', async () => {
    const projectRoot = any.string();
    const workflowsDirectory = `${projectRoot}/.github/workflows`;
    const dumpedWorkflowYaml = any.simpleObject();
    jsYaml.dump
      .withArgs({
        on: {push: {branches: ['alpha']}, workflow_dispatch: {}},
        env: {FORCE_COLOR: 1, NPM_CONFIG_COLOR: 'always'},
        jobs: {
          release: {
            'runs-on': 'ubuntu-latest',
            steps: [
              {uses: 'actions/checkout@v2'},
              {
                name: 'Setup node',
                uses: 'actions/setup-node@v2',
                with: {'node-version-file': '.nvmrc', cache: 'npm'}
              },
              {run: 'npm clean-install'},
              {
                name: 'semantic-release',
                run: 'npx semantic-release',
                env: {
                  GITHUB_TOKEN: '${{ secrets.GITHUB_TOKEN }}',      // eslint-disable-line no-template-curly-in-string
                  NPM_TOKEN: '${{ secrets.NPM_PUBLISH_TOKEN }}'     // eslint-disable-line no-template-curly-in-string
                }
              }
            ]
          }
        }
      })
      .returns(dumpedWorkflowYaml);

    await scaffoldReleaseWorkflow({projectRoot});

    assert.calledWith(fs.writeFile, `${workflowsDirectory}/release.yml`, dumpedWorkflowYaml);
  });
});
