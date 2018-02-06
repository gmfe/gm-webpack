const fs = require('fs');
const path = require('path');

function getJSON(filepath) {
    return JSON.parse(fs.readFileSync(path.resolve(filepath)));
}

module.exports = {
    getJSON
};