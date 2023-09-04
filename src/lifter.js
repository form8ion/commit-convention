import {lift as liftSemanticRelease} from './semantic-release';

export default function ({projectRoot}) {
  return liftSemanticRelease({projectRoot});
}
