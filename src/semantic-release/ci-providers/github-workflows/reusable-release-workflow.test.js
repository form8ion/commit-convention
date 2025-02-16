import {it, describe, expect} from 'vitest';
import any from '@travi/any';

import {determineAppropriateWorkflow} from './reusable-release-workflow.js';

describe('reusable release workflow', () => {
  it('should use the latest semantic-release version for the lowest supported node version', async () => {
    expect(determineAppropriateWorkflow('20')).toEqual('form8ion/.github/.github/workflows/release-package.yml@master');
  });

  it('should use the latest semantic-release version for a higher node version', async () => {
    expect(determineAppropriateWorkflow('22')).toEqual('form8ion/.github/.github/workflows/release-package.yml@master');
  });

  it('should use semantic-release v18 for lower than node v20', async () => {
    expect(determineAppropriateWorkflow(any.fromList(['18', '19'])))
      .toEqual('form8ion/.github/.github/workflows/release-package-semantic-release-22.yml@master');
  });

  it('should use semantic-release v19 for a lower node version', async () => {
    expect(determineAppropriateWorkflow(any.fromList(['14', '16', '17'])))
      .toEqual('form8ion/.github/.github/workflows/release-package-semantic-release-19.yml@master');
  });
});
