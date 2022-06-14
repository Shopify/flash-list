# Contributing

We want this community to be **friendly and respectful** to each other. Please follow our [Code of Conduct](./CODE_OF_CONDUCT.md) in all your interactions with the project.

## Development workflow

To get started with the project, run `yarn up` in the root directory to install the required dependencies for `flash-list` and our fixture app:

```sh
yarn up
```

> This project uses [`yarn`](https://classic.yarnpkg.com/) as a package manager. While it's possible to run individual commands with [`npm`](https://github.com/npm/cli), please refrain from using it, especially `npm install.` 🙅

While developing, you can run the [fixture app](/fixture/) to test your changes. To see your changes done in `flash-list` inside the example app, we recommend to open a terminal and run the following command:

```sh
yarn build --watch
```

This way, `flash-list` gets rebuilt on any Javascript/Typescript change in its codebase.
If you change any native code, then you'll need to rebuild the example app.

To start the packager:

```sh
yarn start
```

To run the fixture app on Android:

```sh
yarn run-android
```

To run the example app on iOS:

```sh
yarn run-ios
```

To run the web sample:

```sh
yarn run-web
```

To fix possible formatting errors, run the following:

```sh
yarn lint --fix
```

Formatting errors will also be automatically fixed if you use Visual Studio Code IDE with the [recommended plugins](.vscode/extensions.json)

Remember to add tests for your change if possible. Run the unit tests by:

```sh
yarn test
```

We also have an e2e screenshot test suite built on top of [Detox](https://github.com/wix/Detox/). You can find the e2e tests [here](https://github.com/Shopify/flash-list/tree/main/fixture/e2e). You can run them with:

```sh
run-e2e-ios
# or on android with
run-e2e-android
```

Usually, the screenshots should not change. However, if you do expect change in the UI, you will need to remove the appropriate image in [this](https://github.com/Shopify/flash-list/tree/main/fixture/e2e/artifacts/ios) folder and re-run the tests again.

### Working with documentation website

The repo contains a documentation website build with [Docusaurus](https://docusaurus.io/). Please make sure that your changes are reflected in the documentation, if it's API or configuration changes. Any improvements to documentation itself are also welcomed.

Source files for documentation can be found in [./documentation/docs](./documentation/docs) folder.

To start working with documentation and run it locally:

1. `cd documentation && yarn`
2. `yarn start`

Now local website is running at http://localhost:3000

### Linting and tests

[ESLint](https://eslint.org/), [Prettier](https://prettier.io/), [TypeScript](https://www.typescriptlang.org/)

We use [TypeScript](https://www.typescriptlang.org/) for type checking, [ESLint](https://eslint.org/) with [Prettier](https://prettier.io/) and [@shopify/eslint-plugin](https://www.npmjs.com/package/@shopify/eslint-plugin) for linting and formatting the code, and [Jest](https://jestjs.io/) for testing.

### Submitting pull requests

Please take some time to correctly fill our [pull request template](.github/PULL_REQUEST_TEMPLATE.md) and detail the proposed changes. This will help reviewers to better understand the context of your PR and provide valuable insights.

When you're sending a pull request:

- Prefer small pull requests focused on one change.
- Update the documentation if your PR changes the API.
- Follow the pull request template when opening a pull request.
- If your PR is a new feature and not a bug fix, consider opening an issue describing your idea. This ensures you get feedback from the maintainers and don't write code that might not be used.

### Releasing a new version

Releases **are done by Shopify engineers** following the steps on [RELEASE.md](./RELEASE.md).
