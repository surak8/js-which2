@ECHO ON
setlocal
SET URL=https://github.com/surak8/js-which.git
git branch --set-upstream-to=origin/master master 
git fetch %URL%
git pull %URL%
