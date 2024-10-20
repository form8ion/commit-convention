import {applyEnhancers} from '@form8ion/core';

import * as semanticReleasePlugin from './semantic-release/index.js';
import * as commitlintPlugin from './commitlint/index.js';

export default async function ({projectRoot}) {
  return applyEnhancers({
    options: {projectRoot},
    enhancers: {
      'semantic-release': semanticReleasePlugin,
      commitlint: commitlintPlugin
    }
  });
}
