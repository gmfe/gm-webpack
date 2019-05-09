'use strict';

const fs = require('fs');
const path = require('path');


// add a tsconfig.json when a project first install gm-webpack
function addTsConfigJson(projectDir) {
  if (!fs.existsSync(path.join(projectDir, './tsconfig.json'))) {
    const myTsConfig = require(path.join(__dirname, '../tsconfig-for-user.json'));
    fs.writeFileSync( path.join(projectDir, 'tsconfig.json'), JSON.stringify(
      myTsConfig, null, 2
    ));
  }
}

function init() {
  const projectDir =  path.join(__dirname, '../../../');
  addTsConfigJson(projectDir);
}

init();