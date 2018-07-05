const fs = require('fs')
const _ = require('lodash')
const {getJSON, shellExec} = require('./service')

const env = process.env.NODE_ENV

let dllFileName = null

// 检查 dll 是否构建过
if (fs.existsSync('./build/dll/dll.version.json')) {
  const {hash} = getJSON('./build/dll/dll.version.json')
  const fileNames = fs.readdirSync('./build/dll/')
  dllFileName = _.find(fileNames, fileName => fileName.endsWith(`${hash}.dll.bundle.js`))
}

if (dllFileName) {
  console.log(`${dllFileName} exist...`)
} else {
  console.log(`dll file not exist...`)

  shellExec('pwd')

  shellExec('rm -rf build/dll')

  shellExec('mkdir -p build/dll')

  shellExec(`NODE_ENV=${env} webpack --config webpack.config.dll.js`)
}
