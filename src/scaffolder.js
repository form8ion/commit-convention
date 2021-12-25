import deepmerge from 'deepmerge';
import {projectTypes} from '@form8ion/javascript-core';

import {scaffold as scaffoldSemanticRelease} from './semantic-release';
import scaffoldCommitizen from './commitizen';
import scaffoldCommitlint from './commitlint';

export default async function ({projectRoot, projectType, configs, pathWithinParent}) {
  const detailsForProjectsPublishedToARegistry = [projectTypes.PACKAGE, projectTypes.CLI].includes(projectType)
    ? scaffoldSemanticRelease()
    : {};

  if (pathWithinParent) return detailsForProjectsPublishedToARegistry;

  const [commitizenResults, commitlintResults] = await Promise.all([
    scaffoldCommitizen({projectRoot}),
    configs.commitlint && scaffoldCommitlint({projectRoot, config: configs.commitlint})
  ]);

  return deepmerge.all([
    commitizenResults,
    ...commitlintResults ? [commitlintResults] : [],
    {
      vcsIgnore: {files: [], directories: []},
      badges: {
        contribution: {
          'commit-convention': {
            img: 'https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg',
            text: 'Conventional Commits',
            link: 'https://conventionalcommits.org'
          }
        }
      }
    },
    detailsForProjectsPublishedToARegistry
  ]);
}
