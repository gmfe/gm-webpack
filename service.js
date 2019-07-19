const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const sh = require('shelljs')
const crypto = require('crypto')

function getJSON (filepath) {
  return JSON.parse(fs.readFileSync(path.resolve(filepath)))
}

function shellExec (com) {
  if (sh.exec(com).code !== 0) {
    sh.exit(1)
  }
}

function getDllVersionHash (dlls, packageJSON) {
  const { devDependencies, dependencies } = packageJSON
  const dllVersionHash = _.map(dlls, v => {
    if (devDependencies[v]) {
      return `${v}@${devDependencies[v]}`
    } else if (dependencies[v]) {
      return `${v}@${dependencies[v]}`
    }
  }).join('');

  return crypto
    .createHmac('sha256', '')
    .update(dllVersionHash)
    .digest('hex')
    .slice(0, 8)
}

module.exports = {
  getJSON,
  shellExec,
  getDllVersionHash
};
