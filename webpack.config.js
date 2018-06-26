const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const HappyPack = require('happypack');
const happyThreadPool = HappyPack.ThreadPool({size: 6});
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin');
const {getJSON} = require('./service');
const {dllVersion, jsVersion} = getJSON('./package.json');
const env = process.env.NODE_ENV;
const isDev = env === 'development';
const manifest = getJSON('./build/dll/dll.manifest.json');

console.log('webpack.config.js', env);

function getDLLFileName() {
    const fileNames = fs.readdirSync(path.resolve('./build/dll/'));

    return _.find(fileNames, fileName => fileName.endsWith(`${dllVersion}.bundle.js`));
}


function getConfig(options) {
    const config = {
        mode: isDev ? 'development' : 'production',
        entry: {
            'commons': options.commons,
            'index': [
                (options.index || './js/index.js')
            ]
        },
        output: {
            path: path.resolve('build'),
            filename: `js/[name].[${isDev ? 'hash' : 'chunkhash'}:8].bundle.js`,
            chunkFilename: 'js/[id].[chunkhash:8].bundle.js',
            publicPath: options.publicPath
        },
        module: {
            rules: [{
                test: /\.js$/,
                loader: 'happypack/loader?id=js',

            }, {
                test: /\.(css|less)$/,
                loader: [
                    MiniCssExtractPlugin.loader,
                    'happypack/loader?id=css'
                ]
            }, {
                test: /\.(jpe?g|png|gif|svg)$/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        limit: 1024,
                        name: 'img/[name].[hash:8].[ext]'
                    }
                }]
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
                __VERSION__: JSON.stringify(jsVersion)
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
                loaders: ['css-loader', 'postcss-loader', 'less-loader']
            }),
            new webpack.DllReferencePlugin({
                context: __dirname,
                manifest
            }),
            new MiniCssExtractPlugin({
                filename: 'css/[name].[contenthash:8].css'
            })
        ]
    };

    if (isDev) {
        config.plugins.push(new webpack.HotModuleReplacementPlugin());

        config.plugins.push(new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'template/index.html'
        }));

        config.devServer = {
            hot: true,
            contentBase: './',
            historyApiFallback: {
                index: options.publicPath + "index.html"
            },
            publicPath: options.publicPath,
            host: '0.0.0.0',
            port: options.port,
            disableHostCheck: true,
            proxy: options.proxy,
            compress: true
        };
    } else {
        config.plugins.push(new webpack.optimize.UglifyJsPlugin({
            cache: true,
            parallel: true,
            sourceMap: true
        }));

        config.plugins.push(new HtmlWebpackPlugin({
            filename: 'index.html',
            template: `template/${options.projectShortName}.html`,
            branch: process.env.GIT_BRANCH || 'master',
            commit: process.env.GIT_COMMIT || ''
        }));
    }

    // 要后于 HtmlWebpackPlugin
    config.plugins.push(new AddAssetHtmlPlugin({
        filepath: path.resolve(`./build/dll/${getDLLFileName()}`),
        outputPath: 'dll',
        includeSourcemap: false,
        hash: true,
        publicPath: options.publicPath + 'dll/'
    }));

    return config;
}

module.exports = getConfig;
