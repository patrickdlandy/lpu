import { parseFile } from 'music-metadata';
import { inspect } from 'util';
import * as fs from 'fs';
import * as path from 'path';



const musicextensions = [".flac"];

function buildMetadataObject(filePath) {
    let metadataObject = {};
    function recursiveScan(fpath) {
        const files = fs.readdirSync(fpath);
        //console.log(files);
        for (let index = 0; index < files.length; index++) {
            if (fs.lstatSync(fpath + "/" + files[index]).isDirectory()) {
                //console.log(`directory: ${files[index]}`);
                recursiveScan(fpath + "/" + files[index]);
            } else if (fs.lstatSync(fpath + "/" + files[index]).isFile()) {
                if (musicextensions.includes(path.extname(files[index]))) {
                    metadataObject[fpath + "/" + files[index]] = parseFile(fpath + "/" + files[index]);
                }
            }
        }
    }
    recursiveScan(filePath);
    return metadataObject;
}

function writeFolders(val) {
    for (let index = 0; index < val.length; index++) {
        if (val[index].status === 'fulfilled' && val[index].value && val[index].value.common) {
            let common = val[index].value.common;
            let folderName = common['albumartist'];
            if (!fs.existsSync(folderName) && folderName != undefined && !folderName.includes('/')){
                fs.mkdirSync(folderName);
                console.log(folderName);
            }
        }
    }

}

console.log("Building file list.");
let trackData = buildMetadataObject(".");
let metadataPromises = Object.values(trackData);
let filePaths = Object.keys(trackData);
console.log(`Detected ${filePaths.length} music files.`);
console.log('Writing new folders.');
Promise.allSettled(metadataPromises).then((val) => writeFolders(val));



