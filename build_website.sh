# create Docusaurus docs

cd documentation
yarn
yarn build
cd ..

# create landing page

cd website
bundle exec jekyll build
cd ..

# copy Docusaurus genereated files to site

cp -R documentation/build website/_site/docs
