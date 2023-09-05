import {fileExists} from '@form8ion/core';

export default function ({projectRoot}) {
  return ['json', 'js', 'cjs']
    .reduce(
      async (acc, extension) => await acc || fileExists(`${projectRoot}/.commitlintrc.${extension}`),
      false
    );
}
