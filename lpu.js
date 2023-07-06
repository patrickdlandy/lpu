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
            let currentTag = "albumartist";
            //console.log(common["albumartist"]);
            if (common[currentTag]) {
                writeCommonTagLine(common, currentTag, filePath);
            }
            
          }
          
        } catch (error) {
          console.error(error.message);
        }
      })();
};

function writeCommonTagLine(common, currentTag, filePath) {
    if (!fs.existsSync(`00_playlists/${currentTag}-common`)){
        fs.mkdirSync(`00_playlists/${currentTag}-common`);
    }
    writeLine("../../" + filePath, `00_playlists/${[currentTag]}-common/${common[currentTag]}.m3u8`);
}

function scanFolder(filePath) {
    const files = fs.readdirSync(filePath);
    if (!fs.existsSync("00_playlists")){
        fs.mkdirSync("00_playlists");
    }
    files.forEach(item => {
        if (fs.lstatSync(filePath + "/" + item).isDirectory()) {
            //console.log(`directory: ${item}`);
            scanFolder(filePath + "/" + item);
        } else if (fs.lstatSync(filePath + "/" + item).isFile()) {
            //console.log(`file: ${item}`);
            if (musicextensions.includes(path.extname(item))) {
                writeLine("../" + filePath + "/" + item, "00_playlists/main.m3u8");
                readTags(filePath + "/" + item);
            }
        }
    });
}

scanFolder(".");

