import any from '@travi/any';
import {it, expect, describe} from 'vitest';

import determineTriggerNeedsFrom from './release-trigger-needs.js';

describe('release-trigger needs', () => {
  it('should not list either job if neither `verify` nor `verify-matrix` are present in `jobs`', async () => {
    expect(determineTriggerNeedsFrom(any.objectWithKeys(any.listOf(any.word)))).toEqual([]);
  });

  it('should should list `verify` if present in `jobs`', async () => {
    expect(determineTriggerNeedsFrom(any.objectWithKeys([...any.listOf(any.word), 'verify']))).toEqual(['verify']);
  });

  it('should list `verify-matrix` if present in `jobs`', async () => {
    expect(determineTriggerNeedsFrom(any.objectWithKeys([...any.listOf(any.word), 'verify-matrix'])))
      .toEqual(['verify-matrix']);
  });

  it('should list `verify` and `verify-matrix` if both are listed in `jobs`', async () => {
    expect(determineTriggerNeedsFrom(any.objectWithKeys(['verify', ...any.listOf(any.word), 'verify-matrix'])))
      .toEqual(['verify', 'verify-matrix']);
  });
});
