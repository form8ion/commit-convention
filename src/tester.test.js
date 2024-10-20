import {describe, expect, it, vi} from 'vitest';
import any from '@travi/any';
import {when} from 'jest-when';

import {test as semanticReleaseIsInUse} from './semantic-release/index.js';
import {test as commitlintIsInUse} from './commitlint/index.js';
import testForCommitConvention from './tester.js';

vi.mock('./semantic-release/tester.js');
vi.mock('./commitlint/tester.js');

describe('predicate', () => {
  const projectRoot = any.string();

  it('should return `true` when semantic-release use is detected', async () => {
    when(semanticReleaseIsInUse).calledWith({projectRoot}).mockResolvedValue(true);
    when(commitlintIsInUse).calledWith({projectRoot}).mockResolvedValue(false);

    expect(await testForCommitConvention({projectRoot})).toBe(true);
  });

  it('should return `true` when commitlint use is detected', async () => {
    when(semanticReleaseIsInUse).calledWith({projectRoot}).mockResolvedValue(false);
    when(commitlintIsInUse).calledWith({projectRoot}).mockResolvedValue(true);

    expect(await testForCommitConvention({projectRoot})).toBe(true);
  });

  it('should return `false` when neither semantic-release nor commitlint use is detected', async () => {
    when(semanticReleaseIsInUse).calledWith({projectRoot}).mockResolvedValue(false);
    when(commitlintIsInUse).calledWith({projectRoot}).mockResolvedValue(false);

    expect(await testForCommitConvention({projectRoot})).toBe(false);
  });
});
