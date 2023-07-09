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

function clearFolder(folderName) {
    fs.rmSync(folderName, { recursive: true, force: true });
}

function writeLine(filePath, filename) {
    fs.appendFile(filename, filePath + "\n", function(err) {
        if (err) throw err;
        //console.log(`Wrote ${filePath} to ${filename}`)
    });
}

function writeTagLine(value, currentTag, filePath, tagType) {
    value.replace(/[^a-z0-9]/gi, '_');
    if (!fs.existsSync(`00_playlists/${currentTag}-${tagType}`)){
        fs.mkdirSync(`00_playlists/${currentTag}-${tagType}`);
    }
    writeLine("../../" + filePath, `00_playlists/${[currentTag]}-${tagType}/${value}.m3u8`);
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

const writePlaylists = function(val) {
    //console.log(val);
    for (let index = 0; index < val.length; index++) {
        // console.log(val[index]);
        // console.log(filePaths[index]);
        writeLine("../" + filePaths[index], "00_playlists/main.m3u8");
        //common tags
        //console.log(val[index].common);
        if (val[index].status === 'fulfilled' && val[index].value && val[index].value.common) {
            let common = val[index].value.common;
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
                                if (val[index].value.native && val[index].value.native.vorbis) {
                                    let vorbis = val[index].value.native.vorbis;
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
                            if (val[index].value.native && val[index].value.native.vorbis) {
                                let vorbis = val[index].value.native.vorbis;
                                if (vorbis.length > 0) {
                                    vorbis.forEach(function(tagTwo) {
                                        
                                        //check to see if this song has tagOne and store value if so
                                        if (tagTwo.id === tagOne) {
                                            //clean
                                            if (tagTwo.value) {
                                                let cleanTag = tagTwo.value.replace(/[^a-z0-9]/gi, '_');
                                                writeTagLine(`${cleanTag}-${tagData}`, `${tagTwo.id}-${currentTag}`, filePaths[index], "combination");
                                            }
                                            
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
        if (val[index].status === 'fulfilled' && val[index].value.native && val[index].value.native.vorbis) {
            let vorbis = val[index].value.native.vorbis;
            if (vorbis.length > 0) {
                vorbis.forEach(function(tag) {
                    if (vorbistags.includes(tag.id)) {
                        // console.log(tag.id + " " + tag.value);
                        // console.log(vorbis);
                        //clean tags
                        let cleanTag = tag.value.replace(/[^a-z0-9]/gi, '_');
                        writeTagLine(cleanTag, tag.id, filePaths[index], "vorbis");
                        //combination tags
                        combinationvorbistags.forEach((tagOne)=> {
                            vorbis.forEach(function(tagTwo) {
                                if (tagTwo.id === tagOne && tagOne != tag.id) {
                                    writeTagLine(`${tagTwo.value}-${cleanTag}`, `${tagTwo.id}-${tag.id}`, filePaths[index], "combination");
                                }
                            });
                        })
                    }
                });
            }
        }
        

    }
    console.log('Done writing playlists.');
}

console.log("Clearing playlist folder.");
clearFolder("00_playlists");
console.log("Recreating playlist folder.");
if (!fs.existsSync("00_playlists")){
    fs.mkdirSync("00_playlists");
}
console.log("Building track list.");
let trackData = buildMetadataObject(".");
let metadataPromises = Object.values(trackData);
let filePaths = Object.keys(trackData);
console.log(`Detected ${filePaths.length} music files.`);
console.log('Writing playlists.');
Promise.allSettled(metadataPromises).then((val) => writePlaylists(val));



