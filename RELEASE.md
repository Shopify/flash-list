# Release

1. Before releasing a new version of the package, make sure you are pointing to the latest commit from `main`.
2. Run `yarn version` and follow the prompts to choose a version for the package.
3. Push the changes and new tags to GitHub with `git push origin main --follow-tags`.
4. Publish the release on [Github Releases](https://github.com/Shopify/flash-list/releases) and the package should be automatically published by Github Actions.
