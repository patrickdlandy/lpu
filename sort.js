import * as fs from 'fs';
import * as path from 'path';

function sortPlaylists(filePath) {
    //sorts all .m3u8 playlist files in filePath
    console.log(`Sorting playlists in ${filePath}`);
    //console.log(fs.readFileSync);
    const files = fs.readdirSync(filePath);
    for (let index = 0; index < files.length; index++) {
        if (fs.lstatSync(filePath + "/" + files[index]).isDirectory()) {
            // console.log(`directory: ${files[index]}`);
            // console.log(filePath + "/" + files[index]);
            sortPlaylists(filePath + "/" + files[index]);
        } else if (fs.lstatSync(filePath + "/" + files[index]).isFile()) {
            //console.log(`file: ${files[index]}`);
            if (path.extname(filePath + "/" + files[index]) === ".m3u8") {
                //console.log(`sorting ${files[index]}`);
                //console.log(filePath + "/" + files[index]);
                let lines = fs.readFileSync(filePath + "/" + files[index], { encoding: 'utf8', flag: 'r' }).split("\n");;
                //console.log(lines);
                lines.sort();// Write the sorted array back to the file
                //console.log(lines);
                fs.writeFileSync(filePath + "/" + files[index], lines.join('\n'));
            }
        }
    };
    console.log(`Done sorting playlists in ${filePath}`);
}

sortPlaylists("00_playlists");