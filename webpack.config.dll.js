const webpack = require('webpack');
const path = require('path');
const HappyPack = require('happypack');
const happyThreadPool = HappyPack.ThreadPool({size: 6});
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const {getJSON} = require('./service');
const {dllVersion} = getJSON('./package.json');

const env = process.env.NODE_ENV;

console.log('dll env', env);

const isDev = env === 'development';

function getConfig(options) {
    const config = {
        entry: {
            'dll': options.dll
        },
        output: {
            path: path.resolve('build'),
            filename: `dll/[hash:8].${dllVersion}.bundle.js`,
            library: 'dll_library',
            publicPath: options.publicPath
        },
        module: {
            rules: [{
                test: /\.js/,
                loader: 'happypack/loader?id=js'
            }, {
                test: /\.(css|less)$/,
                loader: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: 'happypack/loader?id=css'
                })
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
                __DEBUG__: isDev,
                "process.env": { // 干掉 https://fb.me/react-minification 提示
                    NODE_ENV: isDev ? JSON.stringify("development") : JSON.stringify("production")
                }
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
            })
        ]
    };


    if (isDev) {
        config.devtool = 'eval';
    } else {
        config.plugins.push(new webpack.optimize.UglifyJsPlugin({
            cache: true,
            parallel: true,
            sourceMap: true
        }));

        config.devtool = 'source-map';
    }

    return config;
}

module.exports = getConfig;
