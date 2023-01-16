import {promises as fs} from 'fs';

import {test as ciProviderCanBeLifted, lift as liftCiProvider} from './ci-providers';

export default async function ({projectRoot}) {
  if (await ciProviderCanBeLifted({projectRoot})) {
    const nodeVersion = await fs.readFile(`${projectRoot}/.nvmrc`, 'utf-8');

    await liftCiProvider({projectRoot, nodeVersion});
  }

  return {};
}
