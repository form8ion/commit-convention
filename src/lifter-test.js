import {assert} from 'chai';
import sinon from 'sinon';
import any from '@travi/any';

import * as semanticReleaseTester from './semantic-release/tester.js';
import * as semanticReleaseLifter from './semantic-release/lifter.js';
import lift from './lifter.js';

suite('lifter', () => {
  let sandbox;
  const projectRoot = any.string();

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(semanticReleaseTester, 'default');
    sandbox.stub(semanticReleaseLifter, 'default');
  });

  teardown(() => sandbox.restore());

  test('that the sublifters are executed', async () => {
    const semanticReleaseResults = any.simpleObject();
    semanticReleaseTester.default.withArgs({projectRoot}).resolves(true);
    semanticReleaseLifter.default.withArgs({projectRoot}).resolves(semanticReleaseResults);

    assert.deepEqual(await lift({projectRoot}), semanticReleaseResults);
  });

  test('that the semantic-release lifter is not executed if not in use for the project', async () => {
    semanticReleaseTester.default.withArgs({projectRoot}).resolves(false);

    assert.deepEqual(await lift({projectRoot}), {});
  });
});
