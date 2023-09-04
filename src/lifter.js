import {test as semanticReleaseIsInUse, lift as liftSemanticRelease} from './semantic-release';

export default async function ({projectRoot}) {
  if (await semanticReleaseIsInUse({projectRoot})) {
    return liftSemanticRelease({projectRoot});
  }

  return {};
}
