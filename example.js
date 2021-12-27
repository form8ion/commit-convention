// #### Import
// remark-usage-ignore-next
import stubbedFs from 'mock-fs';
import {packageManagers} from '@form8ion/javascript-core';
import {scaffold, test, lift} from './lib/index.cjs';

// remark-usage-ignore-next
stubbedFs({'package.json': JSON.stringify({version: '0.0.0-semantically-released'})});

// #### Execute

(async () => {
  const projectRoot = process.cwd();

  await scaffold({projectRoot, configs: {}});

  if (await test({projectRoot})) {
    await lift({projectRoot, packageManager: packageManagers.NPM});
  }
})();
