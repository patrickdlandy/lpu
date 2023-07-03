# Local Playlist Utility (lpu)

## Goals
1. Generate a root m3u8 playlist file based on the file paths of all music files inside of the current directory and recursively within subdirectories. The paths should be relative to the location of the playlist file generated, and this playlist should work in RockBox and on FooBar 2000 and WinAmp.

2. Once the root playlist file functionality is in place, expand functionality to include playlists generated at different subdirectory depths.

3. Advanced feature ideas:
  1. Recursively "clear all" (remove all .m3u8 files) feature
  2. Generate based on file tags like Genre
  3. Toggle yes/no to add timestamps to filenames

## Accessing a filesystem in JS

https://web.dev/read-files/
https://stackoverflow.com/questions/21012580/is-it-possible-to-write-data-to-file-using-only-javascript

It looks like it is possible to read local files, generate a file, and allow the user to download it. This sounds useful for the root m3u functionality but not for anything else. Maybe I will try this first, maybe attempt a node solution for the other features.

Right away it looks like a web browser is not going to be an optimal solution. For security reasons, a folder cannot be chosen when selecting a file so that the web browser can't access the user's filesystem.

Looks like I will need node.js or a back end language. Probably want to go with Node.js.

https://www.youtube.com/watch?v=MJ3DQa7utFA
https://tutorialedge.net/nodejs/reading-writing-files-with-nodejs/

Additional links:

https://youtu.be/GMf30xyRv9M



