import {mergeIntoExistingPackageJson} from '@form8ion/javascript-core';

export default async function ({projectRoot}) {
  await mergeIntoExistingPackageJson({projectRoot, config: {version: '0.0.0-semantically-released'}});

  return {
    badges: {
      contribution: {
        'semantic-release': {
          img: 'https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release',
          text: 'semantic-release: angular',
          link: 'https://github.com/semantic-release/semantic-release'
        }
      }
    }
  };
}
