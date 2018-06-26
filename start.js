const sh = require('shelljs');

require('./dll.js');

sh.exec('rm -rf build/js build/img build/css build/font build/index.html');

sh.exec('NODE_ENV=development webpack-dev-server');