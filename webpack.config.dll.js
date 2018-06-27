const webpack = require('webpack');
const path = require('path');
const os = require('os');
const fs = require('fs');
const _ = require('lodash');
const HappyPack = require('happypack');
const happyThreadPool = HappyPack.ThreadPool({size: os.cpus().length});
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const {getJSON, getDllVersionHash} = require('./service');
const packageJSON = getJSON('./package.json');

const env = process.env.NODE_ENV;

console.log('webpack.config.dll.js NODE_ENV', env);

const isDev = env === 'development';

function getConfig(options) {
    // 生成一个文件，记录dll的版本，以便下次判断已构建过，避免重复构建
    const dllVersionHash = getDllVersionHash(options.dll, packageJSON);
    fs.writeFileSync('./build/dll/dll.version.json', JSON.stringify({hash: dllVersionHash}));

    const config = {
        mode: env,
        entry: {
            'dll': options.dll
        },
        output: {
            path: path.resolve('build'),
            filename: `dll/[hash:8].${dllVersionHash}.dll.bundle.js`,
            library: 'dll_library',
            publicPath: options.publicPath
        },
        module: {
            rules: [{
                test: /\.js/,
                loader: 'happypack/loader?id=js'
            }, {
                test: /\.(css|less)$/,
                loader: [
                    MiniCssExtractPlugin.loader,
                    'happypack/loader?id=css'
                ]
            }, {
                test: /(fontawesome-webfont|glyphicons-halflings-regular|iconfont)\.(woff|woff2|ttf|eot|svg)($|\?)/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        limit: 1024,
                        name: 'font/[name].[hash:8].[ext]'
                    }
                }]
            }]
        },
        plugins: [
            new webpack.DefinePlugin({
                __DEBUG__: isDev
            }),
            new webpack.DllPlugin({
                path: path.resolve('build/dll/dll.manifest.json'),
                name: 'dll_library'
            }),
            new HappyPack({
                id: 'js',
                threadPool: happyThreadPool,
                loaders: [{
                    path: 'babel-loader',
                    query: {
                        cacheDirectory: true
                    }
                }]
            }),
            new HappyPack({
                id: 'css',
                threadPool: happyThreadPool,
                loaders: ['css-loader', 'less-loader']
            }),
            new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
        ]
    };

    if (!isDev) {
        config.devtool = 'source-map';
    }

    return config;
}

module.exports = getConfig;
