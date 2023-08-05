import {promises as fs} from 'fs';

import {test as ciProviderCanBeLifted, lift as liftCiProvider} from './ci-providers';

export default async function ({projectRoot}) {
  if (await ciProviderCanBeLifted({projectRoot})) {
    const nodeVersion = await fs.readFile(`${projectRoot}/.nvmrc`, 'utf-8');

    await liftCiProvider({projectRoot, nodeVersion});
  }

  return {
    badges: {
      contribution: {
        'semantic-release': {
          img: 'https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release',
          text: 'semantic-release: angular',
          link: 'https://github.com/semantic-release/semantic-release'
        }
      }
    }
  };
}
