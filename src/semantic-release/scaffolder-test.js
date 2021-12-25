import {assert} from 'chai';

import scaffoldSemanticRelease from './scaffolder';

suite('semantic-release scaffolder', () => {
  test('that that the badge and version string are generated', async () => {
    assert.deepEqual(
      await scaffoldSemanticRelease(),
      {
        packageProperties: {version: '0.0.0-semantically-released'},
        badges: {
          contribution: {
            'semantic-release': {
              img: 'https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release',
              text: 'semantic-release: angular',
              link: 'https://github.com/semantic-release/semantic-release'
            }
          }
        }
      }
    );
  });
});
