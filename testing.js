const {shellExec} = require('./service')

shellExec('NODE_ENV=production node ./node_modules/gm-webpack/dll.js')

// 移除 build 目录 dll 除外的其他文件
shellExec('cd ./build; rm -rf `ls | egrep -v dll`; cd ..')

shellExec('NODE_ENV=production webpack -p')
