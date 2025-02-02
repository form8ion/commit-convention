import {promises as fs} from 'node:fs';

export default async function ({projectRoot}) {
  // use loader from js-core once upgraded
  const {version} = JSON.parse(await fs.readFile(`${projectRoot}/package.json`, 'utf-8'));

  return '0.0.0-semantically-released' === version;
}
