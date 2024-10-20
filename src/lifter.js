import {applyEnhancers} from '@form8ion/core';

import * as semanticReleasePlugin from './semantic-release/index.js';
import * as commitlintPlugin from './commitlint/index.js';

export default async function ({projectRoot, configs}) {
  return applyEnhancers({
    options: {projectRoot, configs},
    enhancers: {
      'semantic-release': semanticReleasePlugin,
      commitlint: commitlintPlugin
    }
  });
}
