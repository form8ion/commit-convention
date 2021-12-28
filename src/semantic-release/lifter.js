import {test as ciProviderCanBeLifted, lift as liftCiProvider} from './ci-providers';

export default async function ({projectRoot}) {
  if (await ciProviderCanBeLifted({projectRoot})) await liftCiProvider({projectRoot});

  return {};
}
