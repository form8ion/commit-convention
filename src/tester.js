import {test as semanticReleaseIsInUse} from './semantic-release';

export default function ({projectRoot}) {
  return semanticReleaseIsInUse({projectRoot});
}
