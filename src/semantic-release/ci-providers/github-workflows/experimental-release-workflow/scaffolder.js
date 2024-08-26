import {writeWorkflowFile} from '@form8ion/github-workflows-core';

import {determineAppropriateWorkflow} from '../reusable-release-workflow.js';

export default async function ({projectRoot, nodeVersion}) {
  await writeWorkflowFile({
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
          uses: determineAppropriateWorkflow(nodeVersion),
          // eslint-disable-next-line no-template-curly-in-string
          secrets: {NPM_TOKEN: '${{ secrets.NPM_PUBLISH_TOKEN }}'}
        }
      }
    }
  });
}
