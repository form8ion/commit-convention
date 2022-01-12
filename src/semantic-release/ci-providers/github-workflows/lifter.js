import {promises as fs} from 'fs';
import {load, dump} from 'js-yaml';
import {fileExists} from '@form8ion/core';

import scaffoldReleaseWorkflow from './scaffolder';

export default async function ({projectRoot, vcs: {name: vcsProjectName, owner: vcsOwner}}) {
  const pathToVerificationWorkflow = `${projectRoot}/.github/workflows/node-ci.yml`;

  if (!await fileExists(`${projectRoot}/.github/workflows/release.yml`)) {
    await scaffoldReleaseWorkflow({projectRoot});
  }

  const parsedVerificationWorkflowDetails = load(await fs.readFile(pathToVerificationWorkflow, 'utf-8'));
  const {release, ...otherJobs} = parsedVerificationWorkflowDetails.jobs;
  parsedVerificationWorkflowDetails.jobs = {
    ...otherJobs,
    'trigger-release': {
      'runs-on': 'ubuntu-latest',
      if: "github.event_name == 'push'",
      steps: [{
        uses: 'octokit/request-action@v2.x',
        with: {
          route: 'POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches',
          owner: vcsOwner,
          repo: vcsProjectName,
          ref: '${{ github.ref }}',                       // eslint-disable-line no-template-curly-in-string
          workflow_id: 'release.yml'
        },
        env: {
          GITHUB_TOKEN: '${{ secrets.GH_PAT }}'         // eslint-disable-line no-template-curly-in-string
        }
      }]
    }
  };

  await fs.writeFile(pathToVerificationWorkflow, dump(parsedVerificationWorkflowDetails));
}
