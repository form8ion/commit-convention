import {promises as fs} from 'fs';
import jsYaml from 'js-yaml';

import {assert} from 'chai';
import sinon from 'sinon';
import any from '@travi/any';

import * as reusableWorkflow from '../reusable-release-workflow.js';
import scaffoldReleaseWorkflow from './scaffolder.js';

suite('github release workflow scaffolder', () => {
  let sandbox;
  const nodeVersion = any.string();

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(fs, 'writeFile');
    sandbox.stub(jsYaml, 'dump');
    sandbox.stub(reusableWorkflow, 'determineAppropriateWorkflow');
  });

  teardown(() => sandbox.restore());

  test('that release workflow is defined', async () => {
    const projectRoot = any.string();
    const workflowsDirectory = `${projectRoot}/.github/workflows`;
    const dumpedWorkflowYaml = any.simpleObject();
    const reusableReleaseWorkflowReference = any.string();
    reusableWorkflow.determineAppropriateWorkflow.withArgs(nodeVersion).returns(reusableReleaseWorkflowReference);
    jsYaml.dump
      .withArgs({
        name: 'Release',
        on: {push: {branches: ['alpha']}},
        permissions: {contents: 'read'},
        jobs: {
          release: {
            permissions: {
              contents: 'write',
              'id-token': 'write',
              issues: 'write',
              'pull-requests': 'write'
            },
            uses: reusableReleaseWorkflowReference,
            // eslint-disable-next-line no-template-curly-in-string
            secrets: {NPM_TOKEN: '${{ secrets.NPM_PUBLISH_TOKEN }}'}
          }
        }
      })
      .returns(dumpedWorkflowYaml);

    await scaffoldReleaseWorkflow({projectRoot, nodeVersion});

    assert.calledWith(fs.writeFile, `${workflowsDirectory}/experimental-release.yml`, dumpedWorkflowYaml);
  });
});
