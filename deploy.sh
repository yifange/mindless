cd ngapp
grunt clean --force
grunt build
cd ..
git add -u .
git commit
git push origin master
git subtree push --prefix api heroku master

