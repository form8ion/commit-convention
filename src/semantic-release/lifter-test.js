import {assert} from 'chai';
import sinon from 'sinon';
import any from '@travi/any';

import * as githubWorkflowsTester from './ci-providers/github-workflows/tester';
import * as githubWorkflowsLifter from './ci-providers/github-workflows/lifter';
import lift from './lifter';

suite('semantic-release lifter', () => {
  let sandbox;
  const projectRoot = any.string();

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(githubWorkflowsTester, 'default');
    sandbox.stub(githubWorkflowsLifter, 'default');
  });

  teardown(() => sandbox.restore());

  test('that results are returned', async () => {
    githubWorkflowsTester.default.resolves(false);

    assert.deepEqual(await lift({projectRoot}), {});
    assert.notCalled(githubWorkflowsLifter.default);
  });

  test('that the ci provider is lifted when supported', async () => {
    githubWorkflowsTester.default.withArgs({projectRoot}).resolves(true);

    assert.deepEqual(await lift({projectRoot}), {});
    assert.calledWith(githubWorkflowsLifter.default, {projectRoot});
  });
});
