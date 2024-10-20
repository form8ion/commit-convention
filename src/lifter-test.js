import core from '@form8ion/core';

import {assert} from 'chai';
import sinon from 'sinon';
import any from '@travi/any';

import * as semanticReleasePlugin from './semantic-release/index.js';
import lift from './lifter.js';

suite('lifter', () => {
  let sandbox;
  const projectRoot = any.string();

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(core, 'applyEnhancers');
  });

  teardown(() => sandbox.restore());

  test('that the enhancers are applied', async () => {
    const enhancerResults = any.simpleObject();
    core.applyEnhancers
      .withArgs({options: {projectRoot}, enhancers: {'semantic-release': semanticReleasePlugin}})
      .resolves(enhancerResults);

    assert.deepEqual(await lift({projectRoot}), enhancerResults);
  });
});
