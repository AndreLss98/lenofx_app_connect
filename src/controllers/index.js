const fs = require('fs');
const path = require('path');

function requireSubDirFiles(dir, app) {
    const files = fs.readdirSync(dir).filter(file => file !== 'index.js');
    for (let file of files) {
        if (fs.lstatSync(`${dir}/${file}`).isDirectory()) {
            requireSubDirFiles(`${dir}/${file}`, app);
        } else {
            require(path.resolve(dir, file))(app);
        }
    }
}

module.exports = app => {
    requireSubDirFiles(__dirname, app);
}