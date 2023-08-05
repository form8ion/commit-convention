import {mergeIntoExistingPackageJson} from '@form8ion/javascript-core';

export default async function ({projectRoot}) {
  await mergeIntoExistingPackageJson({projectRoot, config: {version: '0.0.0-semantically-released'}});

  return {};
}
