#!/bin/sh
set -eu

REPO_ROOT=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd -P)
cd "$REPO_ROOT"

# create Docusaurus docs

cd documentation
yarn --frozen-lockfile
yarn build
cd ..

# create landing page

cd website
bundle exec jekyll build
cd ..

# Copy Docusaurus files without nesting or keeping stale documentation pages.

mkdir -p website/_site/docs
rsync -a --delete documentation/build/ website/_site/docs/
