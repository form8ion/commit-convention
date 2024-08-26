import {assert} from 'chai';
import any from '@travi/any';

import {determineAppropriateWorkflow} from './reusable-release-workflow.js';

suite('reusable release workflow', () => {
  test('that the reusable workflow is defined for semantic-release\'s minimum node version', async () => {
    assert.equal(determineAppropriateWorkflow('18'), 'form8ion/.github/.github/workflows/release-package.yml@master');
  });

  test('that the reusable workflow is defined for a higher node version', async () => {
    assert.equal(determineAppropriateWorkflow('20'), 'form8ion/.github/.github/workflows/release-package.yml@master');
  });

  test('that the reusable workflow for semantic-release v19 is defined for a lower node version', async () => {
    assert.equal(
      determineAppropriateWorkflow(any.fromList(['14', '16', '17'])),
      'form8ion/.github/.github/workflows/release-package-semantic-release-19.yml@master'
    );
  });
});
