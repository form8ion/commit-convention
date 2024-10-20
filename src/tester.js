import {test as semanticReleaseIsInUse} from './semantic-release/index.js';
import {test as commitlintIsInUse} from './commitlint/index.js';

export default async function ({projectRoot}) {
  return await semanticReleaseIsInUse({projectRoot}) || commitlintIsInUse({projectRoot});
}
