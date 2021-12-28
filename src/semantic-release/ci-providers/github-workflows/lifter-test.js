import * as core from '@form8ion/core';

import any from '@travi/any';
import {assert} from 'chai';
import sinon from 'sinon';

import * as scaffolder from './scaffolder';
import lift from './lifter';

suite('github-workflows lifter for semantic-release', () => {
  let sandbox;
  const projectRoot = any.string();

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(core, 'fileExists');
    sandbox.stub(scaffolder, 'default');
  });

  teardown(() => sandbox.restore());

  test('that the release workflow is added if it doesnt already exist', async () => {
    core.fileExists.resolves(false);

    await lift({projectRoot});

    assert.calledWith(scaffolder.default, {projectRoot});
  });

  test('that the release workflow is not added if it already exists', async () => {
    core.fileExists.withArgs(`${projectRoot}/.github/workflows/release.yml`).resolves(true);

    await lift({projectRoot});

    assert.notCalled(scaffolder.default);
  });
});
