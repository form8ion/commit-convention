import * as core from '@form8ion/core';

import any from '@travi/any';
import sinon from 'sinon';
import {assert} from 'chai';
import projectUsesGithubWorkflows from './tester';

suite('GitHub workflows predicate', () => {
  const projectRoot = any.string();
  let sandbox;

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(core, 'directoryExists');
  });

  teardown(() => sandbox.restore());

  test('that `true` is returned when the project uses GitHub workflows', async () => {
    core.directoryExists.withArgs(`${projectRoot}/.github/workflows`).resolves(true);

    assert.isTrue(await projectUsesGithubWorkflows({projectRoot}));
  });

  test('that `false` is returned when the project uses GitHub workflows', async () => {
    core.directoryExists.resolves(false);

    assert.isFalse(await projectUsesGithubWorkflows({projectRoot}));
  });
});
