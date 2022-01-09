import {test as ciProviderCanBeLifted, lift as liftCiProvider} from './ci-providers';

export default async function ({projectRoot, vcs}) {
  if (await ciProviderCanBeLifted({projectRoot})) await liftCiProvider({projectRoot, vcs});

  return {};
}
