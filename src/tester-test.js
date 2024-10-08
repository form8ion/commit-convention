import {assert} from 'chai';
import any from '@travi/any';
import sinon from 'sinon';

import * as semanticReleaseTester from './semantic-release/tester.js';
import testForCommitConvention from './tester.js';

suite('predicate', () => {
  const projectRoot = any.string();

  let sandbox;

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(semanticReleaseTester, 'default');
  });

  teardown(() => sandbox.restore());

  test('that `true` is returned when semantic-release use is detected', async () => {
    semanticReleaseTester.default.withArgs({projectRoot}).resolves(true);

    assert.isTrue(await testForCommitConvention({projectRoot}));
  });

  test('that `false` is returned when semantic-release use is not detected', async () => {
    semanticReleaseTester.default.withArgs({projectRoot}).resolves(false);

    assert.isFalse(await testForCommitConvention({projectRoot}));
  });
});
