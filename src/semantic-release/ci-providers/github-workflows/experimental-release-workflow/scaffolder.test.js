import {writeWorkflowFile} from '@form8ion/github-workflows-core';

import any from '@travi/any';
import {it, vi, describe, expect} from 'vitest';
import {when} from 'jest-when';

import {determineAppropriateWorkflow} from '../reusable-release-workflow.js';
import scaffoldReleaseWorkflow from './scaffolder.js';

vi.mock('@form8ion/github-workflows-core');
vi.mock('../reusable-release-workflow.js');

describe('github experimental release workflow scaffolder', () => {
  it('should define the experimental release workflow', async () => {
    const projectRoot = any.string();
    const nodeVersion = any.string();
    const reusableReleaseWorkflow = any.string();
    when(determineAppropriateWorkflow).calledWith(nodeVersion).mockReturnValue(reusableReleaseWorkflow);

    await scaffoldReleaseWorkflow({projectRoot, nodeVersion});

    expect(writeWorkflowFile).toHaveBeenCalledWith({
      projectRoot,
      name: 'experimental-release',
      config: {
        name: 'Release',
        on: {push: {branches: ['alpha']}},
        permissions: {contents: 'read'},
        jobs: {
          release: {
            permissions: {
              contents: 'write',
              'id-token': 'write',
              issues: 'write',
              'pull-requests': 'write'
            },
            uses: reusableReleaseWorkflow,
            // eslint-disable-next-line no-template-curly-in-string
            secrets: {NPM_TOKEN: '${{ secrets.NPM_PUBLISH_TOKEN }}'}
          }
        }
      }
    });
  });
});
