const sh = require('shelljs');

sh.exec('npm install');
sh.exec('mkdir -p build');

require('./dll.js');

sh.exec('rm -rf build/js build/img build/css build/font build/index.html');

sh.exec('webpack -p --progress');