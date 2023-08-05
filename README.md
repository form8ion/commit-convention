# commit-convention

form8ion plugin for managing tools related to commit conventions

<!--status-badges start -->

[![Node CI Workflow Status][github-actions-ci-badge]][github-actions-ci-link]
[![Codecov][coverage-badge]][coverage-link]
![SLSA Level 2][slsa-badge]

<!--status-badges end -->

## Table of Contents

* [Usage](#usage)
  * [Installation](#installation)
  * [Example](#example)
    * [Import](#import)
    * [Execute](#execute)
* [Contributing](#contributing)
  * [Dependencies](#dependencies)
  * [Verification](#verification)

## Usage

<!--consumer-badges start -->

[![MIT license][license-badge]][license-link]
[![npm][npm-badge]][npm-link]
[![Try @form8ion/commit-convention on RunKit][runkit-badge]][runkit-link]
![node][node-badge]

<!--consumer-badges end -->

### Installation

```sh
$ npm install @form8ion/commit-convention --save-prod
```

### Example

#### Import

```javascript
import {packageManagers} from '@form8ion/javascript-core';
import {scaffold, test, lift} from '@form8ion/commit-convention';
```

#### Execute

```javascript
(async () => {
  const projectRoot = process.cwd();

  await scaffold({projectRoot, configs: {}});

  if (await test({projectRoot})) {
    await lift({projectRoot, packageManager: packageManagers.NPM});
  }
})();
```

## Contributing

<!--contribution-badges start -->

[![PRs Welcome][PRs-badge]][PRs-link]
[![Commitizen friendly][commitizen-badge]][commitizen-link]
[![Conventional Commits][commit-convention-badge]][commit-convention-link]
[![semantic-release: angular][semantic-release-badge]][semantic-release-link]
[![Renovate][renovate-badge]][renovate-link]

<!--contribution-badges end -->

### Dependencies

```sh
$ nvm install
$ npm install
```

### Verification

```sh
$ npm test
```

[PRs-link]: http://makeapullrequest.com

[PRs-badge]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg

[commitizen-link]: http://commitizen.github.io/cz-cli/

[commitizen-badge]: https://img.shields.io/badge/commitizen-friendly-brightgreen.svg

[commit-convention-link]: https://conventionalcommits.org

[commit-convention-badge]: https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg

[semantic-release-link]: https://github.com/semantic-release/semantic-release

[semantic-release-badge]: https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release

[renovate-link]: https://renovatebot.com

[renovate-badge]: https://img.shields.io/badge/renovate-enabled-brightgreen.svg?logo=renovatebot

[github-actions-ci-link]: https://github.com/form8ion/commit-convention/actions?query=workflow%3A%22Node.js+CI%22+branch%3Amaster

[github-actions-ci-badge]: https://github.com/form8ion/commit-convention/workflows/Node.js%20CI/badge.svg

[license-link]: LICENSE

[license-badge]: https://img.shields.io/github/license/form8ion/commit-convention.svg

[npm-link]: https://www.npmjs.com/package/@form8ion/commit-convention

[npm-badge]: https://img.shields.io/npm/v/@form8ion/commit-convention.svg

[runkit-link]: https://npm.runkit.com/@form8ion/commit-convention

[runkit-badge]: https://badge.runkitcdn.com/@form8ion/commit-convention.svg

[coverage-link]: https://codecov.io/github/form8ion/commit-convention

[coverage-badge]: https://img.shields.io/codecov/c/github/form8ion/commit-convention.svg

[node-badge]: https://img.shields.io/node/v/@form8ion/commit-convention?logo=node.js

[slsa-badge]: https://slsa.dev/images/gh-badge-level2.svg
