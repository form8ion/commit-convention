import {promises as fs} from 'node:fs';

import any from '@travi/any';
import {expect, it, describe, vi} from 'vitest';
import {when} from 'vitest-when';

import {test as workflowsAreUsed, lift as liftGithubWorkflows} from './ci-providers/index.js';
import lift from './lifter.js';

vi.mock('node:fs');
vi.mock('./ci-providers/index.js');

describe('semantic-release lifter', () => {
  const projectRoot = any.string();

  it('should define the badge', async () => {
    when(workflowsAreUsed).calledWith({projectRoot}).thenResolve(false);

    expect(await lift({projectRoot})).toEqual({
      badges: {
        contribution: {
          'semantic-release': {
            img: 'https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release',
            text: 'semantic-release: angular',
            link: 'https://github.com/semantic-release/semantic-release'
          }
        }
      }
    });
    expect(liftGithubWorkflows).not.toHaveBeenCalled();
  });

  it('should lift the ci provider when supported', async () => {
    const nodeVersion = `${any.integer()}`;
    when(fs.readFile).calledWith(`${projectRoot}/.nvmrc`, 'utf-8').thenResolve(nodeVersion);
    when(workflowsAreUsed).calledWith({projectRoot}).thenResolve(true);

    await lift({projectRoot});

    expect(liftGithubWorkflows).toHaveBeenCalledWith({projectRoot, nodeVersion});
  });
});
