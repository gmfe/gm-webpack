const {getJSON} = require('./service');
const fs = require('fs');
const sh = require('shelljs');
const _ = require('lodash');

const env = process.env.NODE_ENV;
const isDev = env === 'development';

const {dllVersion} = getJSON('./package.json');

const dll = `build/dll/${dllVersion}.bundle.js`;

let isExist = false;

if (fs.existsSync('build/dll/')) {
    const fileNames = fs.readdirSync('build/dll/');

    isExist = !!_.find(fileNames, fileName => fileName.endsWith(`${dllVersion}.bundle.js`));
}

if (isExist) {
    console.log(`${dll} exist...`);
} else {
    console.log(`${dll} not exist...`);

    sh.exec('pwd');

    sh.exec('rm -rf build/dll');

    sh.exec(`NODE_ENV=${isDev ? 'development' : 'production'} webpack --config webpack.config.dll.js --progress --color`);
}
