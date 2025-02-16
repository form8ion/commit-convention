import {promises as fs} from 'node:fs';

import any from '@travi/any';
import {it, describe, vi, expect} from 'vitest';

import scaffold from './scaffolder.js';

vi.mock('node:fs');

describe('commitizen scaffolder', () => {
  it('should write the config file and define dependencies', async () => {
    const projectRoot = any.string();

    const result = await scaffold({projectRoot});

    expect(fs.writeFile)
      .toHaveBeenCalledWith(
        `${projectRoot}/.czrc`,
        JSON.stringify({path: './node_modules/cz-conventional-changelog'})
      );
    expect(result)
      .toEqual({
        dependencies: {javascript: {development: ['cz-conventional-changelog']}},
        badges: {
          contribution: {
            commitizen: {
              img: 'https://img.shields.io/badge/commitizen-friendly-brightgreen.svg',
              text: 'Commitizen friendly',
              link: 'http://commitizen.github.io/cz-cli/'
            }
          }
        }
      });
  });
});
