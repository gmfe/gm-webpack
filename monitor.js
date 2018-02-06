const sh = require('shelljs');

require('./dll.js');

sh.exec('rm -rf build/js build/img build/css build/font build/index.html');

sh.exec('webpack-dev-server --config webpack.config.monitor.js --progress --color');