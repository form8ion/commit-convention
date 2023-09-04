import deepmerge from 'deepmerge';
import {projectTypes} from '@form8ion/javascript-core';

import sinon from 'sinon';
import any from '@travi/any';
import {assert} from 'chai';

import * as semanticReleaseScaffolder from './semantic-release/scaffolder';
import * as commitizenScaffolder from './commitizen';
import * as commitlintScaffolder from './commitlint/scaffolder';
import scaffoldCommitConvention from './scaffolder';

suite('commit-convention scaffolder', () => {
  let sandbox;
  const projectRoot = any.string();
  const packageManager = any.word();
  const publishedProjectType = any.fromList([projectTypes.PACKAGE, projectTypes.CLI]);
  const mergedResults = any.simpleObject();
  const commitizenResults = any.simpleObject();
  const semanticReleaseResults = any.simpleObject();
  const conventionalCommitsBadge = {
    img: 'https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg',
    text: 'Conventional Commits',
    link: 'https://conventionalcommits.org'
  };

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(deepmerge, 'all');
    sandbox.stub(commitlintScaffolder, 'default');
    sandbox.stub(commitizenScaffolder, 'default');
    sandbox.stub(semanticReleaseScaffolder, 'default');

    commitizenScaffolder.default.withArgs({projectRoot}).resolves(commitizenResults);
    semanticReleaseScaffolder.default.withArgs({projectRoot}).resolves(semanticReleaseResults);
  });

  teardown(() => sandbox.restore());

  test('that tools for the commit-convention are not configured for a sub-project', async () => {
    assert.deepEqual(await scaffoldCommitConvention({pathWithinParent: any.string()}), {});
  });

  test('that only semantic-release is configured for a sub-package', async () => {
    assert.deepEqual(
      await scaffoldCommitConvention({
        projectRoot,
        pathWithinParent: any.string(),
        projectType: publishedProjectType
      }),
      semanticReleaseResults
    );
  });

  test('that the convention is configured', async () => {
    const commitlintConfig = any.simpleObject();
    const commitlintResults = any.simpleObject();
    commitlintScaffolder.default.withArgs({projectRoot, config: commitlintConfig}).resolves(commitlintResults);
    deepmerge.all
      .withArgs([
        commitizenResults,
        commitlintResults,
        {
          vcsIgnore: {files: [], directories: []},
          badges: {contribution: {'commit-convention': conventionalCommitsBadge}}
        },
        {}
      ])
      .returns(mergedResults);

    assert.equal(
      await scaffoldCommitConvention({projectRoot, packageManager, configs: {commitlint: commitlintConfig}}),
      mergedResults
    );
  });

  test('that commitlint is not configured if no config is provided', async () => {
    deepmerge.all
      .withArgs([
        commitizenResults,
        {
          vcsIgnore: {files: [], directories: []},
          badges: {contribution: {'commit-convention': conventionalCommitsBadge}}
        },
        {}
      ])
      .returns(mergedResults);

    assert.deepEqual(
      await scaffoldCommitConvention({projectRoot, configs: {}, packageManager}),
      mergedResults
    );
    assert.notCalled(commitlintScaffolder.default);
  });

  test('that semantic-release is configured for packages', async () => {
    deepmerge.all
      .withArgs([
        commitizenResults,
        {
          vcsIgnore: {files: [], directories: []},
          badges: {contribution: {'commit-convention': conventionalCommitsBadge}}
        },
        semanticReleaseResults
      ])
      .returns(mergedResults);

    assert.deepEqual(
      await scaffoldCommitConvention({projectRoot, projectType: publishedProjectType, configs: {}, packageManager}),
      mergedResults
    );
  });
});
