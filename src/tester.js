import {test as semanticReleaseIsInUse} from './semantic-release/index.js';

export default function ({projectRoot}) {
  return semanticReleaseIsInUse({projectRoot});
}
