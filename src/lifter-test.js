import {assert} from 'chai';
import sinon from 'sinon';
import any from '@travi/any';

import * as semanticReleaseLifter from './semantic-release/lifter';
import lift from './lifter';

suite('lifter', () => {
  let sandbox;

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(semanticReleaseLifter, 'default');
  });

  teardown(() => sandbox.restore());

  test('that the sublifters are executed', async () => {
    const projectRoot = any.string();
    const semanticReleaseResults = any.simpleObject();
    semanticReleaseLifter.default.withArgs({projectRoot}).resolves(semanticReleaseResults);

    assert.deepEqual(await lift({projectRoot}), semanticReleaseResults);
  });
});
