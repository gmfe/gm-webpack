const webpack = require('webpack')
const path = require('path')
const os = require('os')
const fs = require('fs')
const _ = require('lodash')
const HappyPack = require('happypack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const { getJSON } = require('./service')

const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length })
const { version } = getJSON('./package.json')
const env = process.env.NODE_ENV
const isDev = env === 'development'
const manifest = getJSON('./build/dll/dll.manifest.json')

function getDLLFileName() {
  const { hash } = getJSON('./build/dll/dll.version.json')
  const fileNames = fs.readdirSync('./build/dll/')

  return _.find(fileNames, fileName =>
    fileName.endsWith(`${hash}.dll.bundle.js`)
  )
}

function getConfig(options) {
  const config = {
    mode: env,
    entry: options.index || './js/index.js',
    output: {
      path: path.resolve('build'),
      filename: `js/[name].[${isDev ? 'hash' : 'chunkhash'}:8].bundle.js`,
      chunkFilename: 'js/[id].[chunkhash:8].bundle.js',
      publicPath: options.publicPath
    },
    optimization: {
      runtimeChunk: 'single',
      splitChunks: {
        cacheGroups: {
          locale: {
            name: 'locale',
            test: module => {
              const { context } = module
              if (!context) {
                return false
              }
              return (
                context.includes('locales') && !context.includes('node_modules')
              )
            },
            minSize: 0,
            chunks: 'initial',
            priority: 10
          }
        }
      }
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          loader: 'happypack/loader?id=js',
          ...options.jsModuleRule
        },
        {
          test: /\.(css|less)$/,
          loader: [MiniCssExtractPlugin.loader, 'happypack/loader?id=css']
        },
        {
          test: /\.(jpe?g|png|gif)$/,
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: 1024,
                name: 'img/[name].[hash:8].[ext]'
              }
            }
          ]
        },
        {
          test: /svg\/(\w|\W)+\.svg$/,
          use: ['@svgr/webpack']
        },
        {
          test: /(fontawesome-webfont|glyphicons-halflings-regular|iconfont)\.(woff|woff2|ttf|eot|svg)($|\?)/,
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: 1024,
                name: 'font/[name].[hash:8].[ext]'
              }
            }
          ]
        }
      ]
    },
    plugins: [
      new webpack.DefinePlugin({
        __DEBUG__: isDev,
        __VERSION__: JSON.stringify(version)
      }),
      new HappyPack({
        id: 'js',
        threadPool: happyThreadPool,
        loaders: [
          {
            path: 'babel-loader',
            query: {
              cacheDirectory: true
            }
          }
        ]
      }),
      new HappyPack({
        id: 'css',
        threadPool: happyThreadPool,
        loaders: ['css-loader', 'postcss-loader', 'less-loader']
      }),
      new webpack.DllReferencePlugin({
        manifest
      }),
      new MiniCssExtractPlugin({
        filename: 'css/[name].[contenthash:8].css'
      }),
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
    ]
  }

  if (isDev) {
    config.devtool = 'cheap-module-eval-source-map'
    config.plugins.push(new webpack.HotModuleReplacementPlugin())

    config.plugins.push(
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: 'template/index.html'
      })
    )

    config.devServer = {
      hot: true,
      contentBase: './',
      historyApiFallback: {
        index: options.publicPath + 'index.html'
      },
      publicPath: options.publicPath,
      host: '0.0.0.0',
      port: options.port,
      disableHostCheck: true,
      proxy: options.proxy,
      compress: true,
      https: options.https || false
    }
  } else {
    config.plugins.push(
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: `template/${options.projectShortName}.html`,
        branch: process.env.GIT_BRANCH || 'master',
        commit: process.env.GIT_COMMIT || ''
      })
    )

    config.optimization = config.optimization || {}
    config.optimization.minimizer = [
      new TerserPlugin({
        terserOptions: {
          mangle: false // Note `mangle.properties` is `false` by default.
        }
      })
    ]
  }

  // 要后于 HtmlWebpackPlugin
  config.plugins.push(
    new AddAssetHtmlPlugin({
      filepath: path.resolve(`./build/dll/${getDLLFileName()}`),
      outputPath: 'dll',
      includeSourcemap: false,
      hash: true,
      publicPath: options.publicPath + 'dll/'
    })
  )

  return config
}

module.exports = getConfig
