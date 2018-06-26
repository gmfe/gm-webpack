## 使用 

js/index.js

package.json

```
"version": "1.0.0",

"scripts": {
  "start": "node ./node_modules/gm-webpack/start",
  "testing": "GIT_BRANCH=$BRANCH GIT_COMMIT=$COMMIT node ./node_modules/gm-webpack/testing",
  "deploy": "GIT_BRANCH=$BRANCH GIT_COMMIT=$COMMIT node ./node_modules/gm-webpack/deploy",
  "monitor": "node ./node_modules/gm-webpack/monitor"
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
const webpackConfigDll = require('gm-webpack/webpack.config.dll.js');

const config = webpackConfigDll({
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