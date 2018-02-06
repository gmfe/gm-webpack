
# TODO

等js精简后再补map

## 使用 

package.json

```
"scripts": {
  "start": "NODE_ENV=development node ./node_modules/gm-webpack/start",
  "testing": "npm install; NODE_ENV=production GIT_BRANCH=$BRANCH GIT_COMMIT=$COMMIT node ./node_modules/gm-webpack/testing",
  "deploy": "npm install; NODE_ENV=production GIT_BRANCH=$BRANCH GIT_COMMIT=$COMMIT node ./node_modules/gm-webpack/deploy",
  "monitor": "NODE_ENV=development node ./node_modules/gm-webpack/monitor"
}
```

webpack.config.js

```
const path = require('path');
const jsonconf = require('gm-jsonconf');
const siteConfig = jsonconf.parse(path.resolve(__dirname, 'config/deploy.json'));

const webpackConfig = require('gm-webpack/webpack.config.js');

const config = webpackConfig({
    publicPath: siteConfig.publicPath,
    port: siteConfig.port,
    proxy: siteConfig.proxy,
    projectShortName: 'manage',
    commons: [
        'react-gm',
        'gm-font/iconfont.css',
        'gm-util',
        'gm_static_storage'
    ]
});

module.exports = config;

```

webpack.config.dll.js

```
const path = require('path');
const jsonconf = require('gm-jsonconf');
const siteConfig = jsonconf.parse(path.resolve(__dirname, 'config/deploy.json'));
const {version} = require('./package.json');
const webpackConfigDll = require('gm-webpack/webpack.config.dll.js');

const config = webpackConfigDll({
    version,
    publicPath: siteConfig.publicPath,
    dll: [
        'react', 'react-dom',
        'prop-types', 'classnames',

        'redux', 'react-redux', 'redux-thunk', 'redux-async-actions-reducers',

        'react-router', 'react-router-dom', 'history', 'query-string',

        'mobx', 'mobx-react',

        // 工具
        'lodash', 'moment', 'big.js'
    ]
});

module.exports = config;
```

webpack.config.monitor.js

```
const WebpackMonitor = require('webpack-monitor');
const path = require('path');
const config = require('./webpack.config');
const jsonconf = require('gm-jsonconf');
const siteConfig = jsonconf.parse(path.resolve(__dirname, 'config/deploy.json'));

config.plugins.push(new WebpackMonitor({
    launch: true,
    port: siteConfig.port + 1// default -> 8081
}));

module.exports = config;
```