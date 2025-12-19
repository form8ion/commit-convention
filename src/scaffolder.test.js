import deepmerge from 'deepmerge';
import {projectTypes} from '@form8ion/javascript-core';

import any from '@travi/any';
import {it, vi, describe, expect, beforeEach} from 'vitest';
import {when} from 'vitest-when';

import {scaffold as scaffoldCommitlint} from './commitlint/index.js';
import {scaffold as scaffoldCommitizen} from './commitizen/index.js';
import {scaffold as scaffoldSemanticRelease} from './semantic-release/index.js';
import scaffoldCommitConvention from './scaffolder.js';

vi.mock('deepmerge');
vi.mock('./semantic-release/scaffolder.js');
vi.mock('./commitizen/scaffolder.js');
vi.mock('./commitlint/index.js');

describe('commit-convention scaffolder', () => {
  const projectRoot = any.string();
  const publishedProjectType = any.fromList([projectTypes.PACKAGE, projectTypes.CLI]);
  const commitizenResults = any.simpleObject();
  const semanticReleaseResults = any.simpleObject();
  const mergedResults = any.simpleObject();
  const conventionalCommitsBadge = {
    img: 'https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg',
    text: 'Conventional Commits',
    link: 'https://conventionalcommits.org'
  };

  beforeEach(() => {
    when(scaffoldCommitizen).calledWith({projectRoot}).thenResolve(commitizenResults);
    when(scaffoldSemanticRelease).calledWith({projectRoot}).thenResolve(semanticReleaseResults);
  });

  it('should configure the commit convention', async () => {
    const commitlintConfig = any.simpleObject();
    const commitlintResults = any.simpleObject();
    when(scaffoldCommitlint).calledWith({projectRoot, config: commitlintConfig}).thenResolve(commitlintResults);
    when(deepmerge.all)
      .calledWith([
        commitizenResults,
        commitlintResults,
        {
          vcsIgnore: {files: [], directories: []},
          badges: {contribution: {'commit-convention': conventionalCommitsBadge}}
        },
        {}
      ])
      .thenReturn(mergedResults);

    expect(await scaffoldCommitConvention({projectRoot, configs: {commitlint: commitlintConfig}}))
      .toEqual(mergedResults);
  });

  it('should not configure commitlint if no config is provided', async () => {
    when(deepmerge.all).calledWith([
      commitizenResults,
      {
        vcsIgnore: {files: [], directories: []},
        badges: {contribution: {'commit-convention': conventionalCommitsBadge}}
      },
      {}
    ]).thenReturn(mergedResults);

    expect(await scaffoldCommitConvention({projectRoot, configs: {}})).toEqual(mergedResults);
    expect(scaffoldCommitlint).not.toHaveBeenCalled();
  });

  it('should configure semantic-release for publishable project types', async () => {
    when(deepmerge.all).calledWith([
      commitizenResults,
      {
        vcsIgnore: {files: [], directories: []},
        badges: {contribution: {'commit-convention': conventionalCommitsBadge}}
      },
      semanticReleaseResults
    ]).thenReturn(mergedResults);

    expect(await scaffoldCommitConvention({projectRoot, projectType: publishedProjectType, configs: {}}))
      .toEqual(mergedResults);
  });

  it('should not configure tools for the commit-convention for a sub-project', async () => {
    expect(await scaffoldCommitConvention({pathWithinParent: any.string()})).toEqual({});
  });

  it('should only configure semantic-release for a sub-project when the project is publishable', async () => {
    expect(
      await scaffoldCommitConvention({
        projectRoot,
        pathWithinParent: any.string(),
        projectType: publishedProjectType
      })
    ).toEqual(semanticReleaseResults);
  });
});
