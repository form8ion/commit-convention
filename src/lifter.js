import {test as semanticReleaseIsInUse, lift as liftSemanticRelease} from './semantic-release/index.js';

export default async function ({projectRoot}) {
  if (await semanticReleaseIsInUse({projectRoot})) {
    return liftSemanticRelease({projectRoot});
  }

  return {};
}
