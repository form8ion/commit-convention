import {fileTypes} from '@form8ion/core';
import {write} from '@form8ion/config-file';

export default async function ({config, projectRoot}) {
  await write({
    format: fileTypes.JSON,
    name: 'commitlint',
    path: projectRoot,
    config: {extends: [config.name]}
  });

  return {devDependencies: [config.packageName]};
}
