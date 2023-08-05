import jsCore from '@form8ion/javascript-core';

import {assert} from 'chai';
import sinon from 'sinon';
import any from '@travi/any';

import scaffoldSemanticRelease from './scaffolder';

suite('semantic-release scaffolder', () => {
  let sandbox;
  const projectRoot = any.string();

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(jsCore, 'mergeIntoExistingPackageJson');
  });

  teardown(() => sandbox.restore());

  test('that that the badge and version string are generated', async () => {
    assert.deepEqual(await scaffoldSemanticRelease({projectRoot}), {});

    assert.calledWith(
      jsCore.mergeIntoExistingPackageJson,
      {projectRoot, config: {version: '0.0.0-semantically-released'}}
    );
  });
});
