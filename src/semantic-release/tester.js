import {loadPackageJson} from '@form8ion/javascript-core';

export default async function semanticReleaseInUse({projectRoot}) {
  const {version} = await loadPackageJson({projectRoot});

  return '0.0.0-semantically-released' === version;
}
