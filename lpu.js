const fs = require("fs");
const path = require("path");


function folderList() {
    console.log(__dirname);
    const results = fs.readdirSync(__dirname);
    // console.log(results);
    results.forEach(item => {
        if (fs.lstatSync(path.resolve(__dirname, item)).isDirectory()) {
            console.log(item);
        }
    });
}

folderList();


