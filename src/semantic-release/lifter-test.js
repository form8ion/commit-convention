import {promises as fs} from 'fs';

import {assert} from 'chai';
import sinon from 'sinon';
import any from '@travi/any';

import * as githubWorkflowsTester from './ci-providers/github-workflows/tester.js';
import * as githubWorkflowsLifter from './ci-providers/github-workflows/lifter.js';
import lift from './lifter.js';

suite('semantic-release lifter', () => {
  let sandbox;
  const projectRoot = any.string();

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(fs, 'readFile');
    sandbox.stub(githubWorkflowsTester, 'default');
    sandbox.stub(githubWorkflowsLifter, 'default');
  });

  teardown(() => sandbox.restore());

  test('that results are returned', async () => {
    githubWorkflowsTester.default.resolves(false);

    assert.deepEqual(
      await lift({projectRoot}),
      {
        badges: {
          contribution: {
            'semantic-release': {
              img: 'https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release',
              text: 'semantic-release: angular',
              link: 'https://github.com/semantic-release/semantic-release'
            }
          }
        }
      }
    );
    assert.notCalled(githubWorkflowsLifter.default);
  });

  test('that the ci provider is lifted when supported', async () => {
    const nodeVersion = `${any.integer()}`;
    fs.readFile.withArgs(`${projectRoot}/.nvmrc`, 'utf-8').resolves(nodeVersion);
    githubWorkflowsTester.default.withArgs({projectRoot}).resolves(true);

    assert.deepEqual(
      await lift({projectRoot}),
      {
        badges: {
          contribution: {
            'semantic-release': {
              img: 'https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release',
              text: 'semantic-release: angular',
              link: 'https://github.com/semantic-release/semantic-release'
            }
          }
        }
      }
    );
    assert.calledWith(githubWorkflowsLifter.default, {projectRoot, nodeVersion});
  });
});
