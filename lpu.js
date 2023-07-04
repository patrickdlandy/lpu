const fs = require("fs");
const path = require("path");

const musicextensions = [".mp3", ".flac", ".m4a", ".wav"];


function folderList() {
    console.log(__dirname);
    const results = fs.readdirSync(__dirname);
    results.forEach(item => {
        if (fs.lstatSync(path.resolve(__dirname, item)).isDirectory()) {
            console.log(item);
        }
    });
}

//folderList();

function writeLine(filePath, filename) {
    fs.appendFile(filename, filePath + "\n", function(err) {
        if (err) throw err;
        console.log(`Wrote ${filePath} to ${filename}`)
    });
}

//writeLine("/home/patrick/Code/lpu/Steely Dan- Do It Again.mp3","test.m3u8");


function scanFolder(filePath) {
    const files = fs.readdirSync(filePath);
    files.forEach(item => {
        if (fs.lstatSync(path.resolve(filePath, item)).isDirectory()) {
            console.log(`directory: ${item}`);
            scanFolder(path.resolve(filePath, item));
        } else if (fs.lstatSync(path.resolve(filePath, item)).isFile()) {
            console.log(`file: ${item}`);
            if (musicextensions.includes(path.extname(item))) {
                writeLine(path.resolve(filePath, item),"main.m3u8");
            }
        }
    });
}

scanFolder(".");

