import {promises as fs} from 'fs';

export default async function ({projectRoot}) {
  const {version} = JSON.parse(await fs.readFile(`${projectRoot}/package.json`, 'utf-8'));

  return '0.0.0-semantically-released' === version;
}
