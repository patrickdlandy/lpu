import { parseFile } from 'music-metadata';
import { inspect } from 'util';
import * as fs from 'fs';
import * as path from 'path';

// const fs = require("fs");
// const path = require("path");
// const musicMetadata = require("music-metadata");
// const util = require("util");

//consts (refactor to config/defaults later)

const musicextensions = [".mp3", ".flac", ".m4a", ".wav"];

const commontags = ["albumartist", "genre"];


function folderList() {
    console.log(__dirname);
    const results = fs.readdirSync(__dirname);
    results.forEach(item => {
        if (fs.lstatSync(path.resolve(__dirname, item)).isDirectory()) {
            console.log(item);
        }
    });
}

function clearFolder(folderName) {
    fs.rmSync(folderName, { recursive: true, force: true });
}

function sortPlaylists(filePath) {
    //sorts all .m3u8 playlist files in filePath
    const files = fs.readdirSync(filePath);
    files.forEach(item => {
        if (fs.lstatSync(filePath + "/" + item).isDirectory()) {
            //console.log(`directory: ${item}`);
            sortPlaylists(filePath + "/" + item);
        } else if (fs.lstatSync(filePath + "/" + item).isFile()) {
            //console.log(`file: ${item}`);
            if (path.extname(filePath + "/" + item) === ".m3u8") {
                console.log(`sorting ${item}`);
                const lines = fs.readFileSync(filePath + "/" + item, 'utf-8').split('\n');// Sort the array
                lines.sort();// Write the sorted array back to the file
                fs.writeFileSync(filePath + "/" + item, lines.join('\n'));
            }
        }
    });
}

//folderList();

function writeLine(filePath, filename) {
    fs.appendFile(filename, filePath + "\n", function(err) {
        if (err) throw err;
        //console.log(`Wrote ${filePath} to ${filename}`)
    });
}

//writeLine("/home/patrick/Code/lpu/Steely Dan- Do It Again.mp3","test.m3u8");

function readTags(filePath) {
    (async () => {
        try {
            const metadata = await parseFile(filePath);
            //process common tags
            //let common = inspect(metadata.common, { showHidden: false, depth: null });

            //albumartist
            if (metadata.common) {
                let common = metadata.common;
                commontags.forEach(function(currentTag) {
                    //console.log(common["albumartist"]);
                    let tagData = common[currentTag];
                    if (tagData) {
                        if (typeof tagData === "object") {
                            tagData.forEach(function(val) {
                                val = val.replace(/[^a-z0-9]/gi, '_');
                                writeCommonTagLine(val, currentTag, filePath);
                            })
                        } else if (typeof tagData === "string") {
                            tagData = tagData.replace(/[^a-z0-9]/gi, '_');
                            writeCommonTagLine(tagData, currentTag, filePath);
                        }
                    }
                });

            }
            
        } catch (error) {
          console.error(error.message);
        }
    })();
}

function writeCommonTagLine(value, currentTag, filePath) {
    value.replace(/[^a-z0-9]/gi, '_');
    if (!fs.existsSync(`00_playlists/${currentTag}-common`)){
        fs.mkdirSync(`00_playlists/${currentTag}-common`);
    }
    writeLine("../../" + filePath, `00_playlists/${[currentTag]}-common/${value}.m3u8`);
}

async function scanFolder(filePath) {
    // console.log("Scanning folders");
    const files = fs.readdirSync(filePath);
    console.log(files);
    if (!fs.existsSync("00_playlists")){
        fs.mkdirSync("00_playlists");
    }
    
    // create array of parseFile promises, wait for all to be resolved using promise.all, then iterate through array

    //files.forEach(item => {
    for (let index = 0; index < files.length; index++) {
        if (fs.lstatSync(filePath + "/" + files[index]).isDirectory()) {
            //console.log(`directory: ${files[index]}`);
            scanFolder(filePath + "/" + files[index]);
        } else if (fs.lstatSync(filePath + "/" + files[index]).isFile()) {
            //console.log(`file: ${files[index]}`);
            if (musicextensions.includes(path.extname(files[index]))) {
                writeLine("../" + filePath + "/" + files[index], "00_playlists/main.m3u8");
                //readTags(filePath + "/" + files[index]);
                try {
                    await parseFile(filePath + "/" + files[index]).then((metadata) =>{

                        //albumartist
                        if (metadata.common) {
                            let common = metadata.common;
                            commontags.forEach(function(currentTag) {
                                //console.log(common["albumartist"]);
                                let tagData = common[currentTag];
                                if (tagData) {
                                    if (typeof tagData === "object") {
                                        tagData.forEach(function(val) {
                                            val = val.replace(/[^a-z0-9]/gi, '_');
                                            writeCommonTagLine(val, currentTag, filePath + "/" + files[index]);
                                        })
                                    } else if (typeof tagData === "string") {
                                        tagData = tagData.replace(/[^a-z0-9]/gi, '_');
                                        writeCommonTagLine(tagData, currentTag, filePath + "/" + files[index]);
                                    }
                                }
                            });
            
                        }
                        
                    });
                    //process common tags
                    //let common = inspect(metadata.common, { showHidden: false, depth: null });
        
                } catch (error) {
                  console.error(error.message);
                }
            }
        }
    }
    return filePath;
}

// return an object with filepaths as keys and parseFile promises as values

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



// scanFolder(".").then(sortPlaylists("."));

// setTimeout(() => {
//         sortPlaylists(".")
//     }, 30000);
clearFolder("00_playlists");
if (!fs.existsSync("00_playlists")){
    fs.mkdirSync("00_playlists");
}
let trackData = buildMetadataObject(".");
let metadataPromises = Object.values(trackData);
let filePaths = Object.keys(trackData);
Promise.all(metadataPromises).then((val) => {
    for (let index = 0; index < val.length; index++) {
        // console.log(val[index]);
        // console.log(filePaths[index]);
        writeLine("../" + filePaths[index], "00_playlists/main.m3u8");
        //common tags
        if (val[index].common) {
            let common = val[index].common;
            commontags.forEach(function(currentTag) {
                //console.log(common["albumartist"]);
                let tagData = common[currentTag];
                if (tagData) {
                    if (typeof tagData === "object") {
                        tagData.forEach(function(val) {
                            val = val.replace(/[^a-z0-9]/gi, '_');
                            writeCommonTagLine(val, currentTag, filePaths[index]);
                        })
                    } else if (typeof tagData === "string") {
                        tagData = tagData.replace(/[^a-z0-9]/gi, '_');
                        writeCommonTagLine(tagData, currentTag, filePaths[index]);
                    }
                }
            });

        }
    }
});

