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

const commontags = ["albumartist", "genre", "date"];

const vorbistags = ["SOURCE COLLECTION", "STYLE", "PLAYLIST", "RATING"];

const combinationvorbistags = ["RATING"];


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

function writeTagLine(value, currentTag, filePath, tagType) {
    value.replace(/[^a-z0-9]/gi, '_');
    if (!fs.existsSync(`00_playlists/${currentTag}-${tagType}`)){
        fs.mkdirSync(`00_playlists/${currentTag}-${tagType}`);
    }
    writeLine("../../" + filePath, `00_playlists/${[currentTag]}-${tagType}/${value}.m3u8`);
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
                                            writeTagLine(val, currentTag, filePath + "/" + files[index], "common");
                                        })
                                    } else if (typeof tagData === "string") {
                                        tagData = tagData.replace(/[^a-z0-9]/gi, '_');
                                        writeTagLine(tagData, currentTag, filePath + "/" + files[index], "common");
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
                        tagData.forEach(function(tag) {
                            tag = tag.replace(/[^a-z0-9]/gi, '_');
                            writeTagLine(tag, currentTag, filePaths[index], "common");
                            //check for vorbis combination tags
                            combinationvorbistags.forEach((tagOne)=> {
                                //determine if this song has a value for tagOne
                                let hasTag = false;
                                let tagValue = null;
                                if (val[index].native && val[index].native.vorbis) {
                                    let vorbis = val[index].native.vorbis;
                                    if (vorbis.length > 0) {
                                        vorbis.forEach(function(tagTwo) {
                                            //check to see if this song has tagOne and store value if so
                                            if (tagTwo.id === tagOne) {
                                                writeTagLine(`${tagTwo.value}-${tag}`, `${tagTwo.id}-${currentTag}`, filePaths[index], "combination");
                                            }
    
                                        });
                                    }
                                }
                            })
                        })
                    } else if (typeof tagData === "string") {
                        tagData = tagData.replace(/[^a-z0-9]/gi, '_');
                        writeTagLine(tagData, currentTag, filePaths[index], "common");
                        //check for vorbis combination tags
                        combinationvorbistags.forEach((tagOne)=> {
                            //determine if this song has a value for tagOne
                            let hasTag = false;
                            let tagValue = null;
                            if (val[index].native && val[index].native.vorbis) {
                                let vorbis = val[index].native.vorbis;
                                if (vorbis.length > 0) {
                                    vorbis.forEach(function(tagTwo) {
                                        //check to see if this song has tagOne and store value if so
                                        if (tagTwo.id === tagOne) {
                                            writeTagLine(`${tagTwo.value}-${tagData}`, `${tagTwo.id}-${currentTag}`, filePaths[index], "combination");
                                        }

                                    });
                                }
                            }
                        })
                    }
                }
            });
        }
        //vorbis tags
        if (val[index].native && val[index].native.vorbis) {
            let vorbis = val[index].native.vorbis;
            if (vorbis.length > 0) {
                vorbis.forEach(function(tag) {
                    if (vorbistags.includes(tag.id)) {
                        // console.log(tag.id + " " + tag.value);
                        // console.log(vorbis);
                        writeTagLine(tag.value, tag.id, filePaths[index], "vorbis");
                        //combination tags
                        combinationvorbistags.forEach((tagOne)=> {
                            vorbis.forEach(function(tagTwo) {
                                if (tagTwo.id === tagOne && tagOne != tag.id) {
                                    writeTagLine(`${tagTwo.value}-${tag.value}`, `${tagTwo.id}-${tag.id}`, filePaths[index], "combination");
                                }
                            });
                        })
                    }
                });
            }
        }
        

    }
});

