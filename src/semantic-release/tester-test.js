import {promises as fs} from 'fs';

import sinon from 'sinon';
import {assert} from 'chai';
import any from '@travi/any';

import determineIfSemanticReleaseIsConfigured from './tester.js';

suite('semantic-release predicate', () => {
  let sandbox;
  const projectRoot = any.string();

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(fs, 'readFile');
  });

  teardown(() => sandbox.restore());

  test('that `true` is returned when semantic-release is configured for the project', async () => {
    fs.readFile
      .withArgs(`${projectRoot}/package.json`, 'utf-8')
      .resolves(JSON.stringify({...any.simpleObject(), version: '0.0.0-semantically-released'}));

    assert.isTrue(await determineIfSemanticReleaseIsConfigured({projectRoot}));
  });

  test('that `false` is returned when semantic-release is not configured for the current project', async () => {
    fs.readFile.withArgs(`${projectRoot}/package.json`, 'utf-8').resolves(JSON.stringify(any.simpleObject()));

    assert.isFalse(await determineIfSemanticReleaseIsConfigured({projectRoot}));
  });
});
