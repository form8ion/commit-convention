import {assert} from 'chai';
import any from '@travi/any';
import determineTriggerNeedsFrom from './release-trigger-needs.js';

suite('release-trigger needs', () => {
  test('that no jobs are listed if neither `verify` nor `verify-matrix` are present in `jobs`', async () => {
    assert.deepEqual(determineTriggerNeedsFrom(any.objectWithKeys(any.listOf(any.word))), []);
  });

  test('that `verify` is listed if present in `jobs`', async () => {
    assert.deepEqual(determineTriggerNeedsFrom(any.objectWithKeys([...any.listOf(any.word), 'verify'])), ['verify']);
  });

  test('that `verify-matrix` is listed if present in `jobs`', async () => {
    assert.deepEqual(
      determineTriggerNeedsFrom(any.objectWithKeys([...any.listOf(any.word), 'verify-matrix'])),
      ['verify-matrix']
    );
  });

  test('that `verify` and `verify-matrix` are listed if both are present in `jobs`', async () => {
    assert.deepEqual(
      determineTriggerNeedsFrom(any.objectWithKeys(['verify', ...any.listOf(any.word), 'verify-matrix'])),
      ['verify', 'verify-matrix']
    );
  });
});
