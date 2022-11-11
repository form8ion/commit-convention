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
    jsYaml.dump
      .withArgs({
        name: 'Release',
        on: {push: {branches: ['alpha']}},
        jobs: {
          release: {
            uses: 'form8ion/.github/.github/workflows/release-package.yml@master',
            // eslint-disable-next-line no-template-curly-in-string
            secrets: {NPM_TOKEN: '${{ secrets.NPM_PUBLISH_TOKEN }}'}
          }
        }
      })
      .returns(dumpedWorkflowYaml);

    await scaffoldReleaseWorkflow({projectRoot});

    assert.calledWith(fs.writeFile, `${workflowsDirectory}/release.yml`, dumpedWorkflowYaml);
  });
});
