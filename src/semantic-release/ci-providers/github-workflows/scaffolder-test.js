import {promises as fs} from 'fs';
import jsYaml from 'js-yaml';
import * as githubWorkflowsCore from '@form8ion/github-workflows-core';

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
    sandbox.stub(githubWorkflowsCore, 'scaffoldCheckoutStep');
    sandbox.stub(githubWorkflowsCore, 'scaffoldNodeSetupStep');
    sandbox.stub(githubWorkflowsCore, 'scaffoldDependencyInstallationStep');
  });

  teardown(() => sandbox.restore());

  test('that release workflow is defined', async () => {
    const projectRoot = any.string();
    const workflowsDirectory = `${projectRoot}/.github/workflows`;
    const dumpedWorkflowYaml = any.simpleObject();
    const checkoutStep = any.simpleObject();
    const setupNodeStep = any.simpleObject();
    const installDependenciesStep = any.simpleObject();
    jsYaml.dump
      .withArgs({
        name: 'Release',
        on: {push: {branches: ['alpha']}, workflow_dispatch: {}},
        env: {FORCE_COLOR: 1, NPM_CONFIG_COLOR: 'always'},
        jobs: {
          release: {
            'runs-on': 'ubuntu-latest',
            steps: [
              checkoutStep,
              setupNodeStep,
              installDependenciesStep,
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
    githubWorkflowsCore.scaffoldCheckoutStep.returns(checkoutStep);
    githubWorkflowsCore.scaffoldNodeSetupStep.withArgs({versionDeterminedBy: 'nvmrc'}).returns(setupNodeStep);
    githubWorkflowsCore.scaffoldDependencyInstallationStep.returns(installDependenciesStep);

    await scaffoldReleaseWorkflow({projectRoot});

    assert.calledWith(fs.writeFile, `${workflowsDirectory}/release.yml`, dumpedWorkflowYaml);
  });
});
