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

Got root playlist functionality working!

Music metadata library (recent): music-metadata

https://www.npmjs.com/package/music-metadata


Having a module issue. Need to figure out how to use require vs import in order to access the music-metadata library in my code. Not working atm.

Got it working. Needed to make it a module and use the correct library, music-metadata, not musicmetadata.

Here is the structure of what is returned from parseFile:

```json
{
  format: {
    tagTypes: [ 'vorbis' ],
    trackInfo: [],
    container: 'FLAC',
    codec: 'FLAC',
    lossless: true,
    numberOfChannels: 2,
    bitsPerSample: 16,
    sampleRate: 44100,
    duration: 294.4,
    bitrate: 919656.6576086957
  },
  native: {
    vorbis: [
      { id: 'ARTIST', value: '2Pac' },
      { id: 'TITLE', value: "I Ain't Mad At Cha" },
      { id: 'ALBUM', value: 'Greatest Hits' },
      { id: 'DATE', value: '1998' },
      { id: 'GENRE', value: 'Rap' },
      { id: 'GENRE', value: 'Hip Hop' },
      { id: 'ALBUMARTIST', value: '2Pac' },
      { id: 'TRACKNUMBER', value: '3' },
      { id: 'TRACKTOTAL', value: '13' },
      { id: 'DISCNUMBER', value: '2' },
      { id: 'COMMENT', value: ' YEAR: 1998' },
      { id: 'SOURCE COLLECTION', value: '100' },
      { id: 'REPLAYGAIN_ALBUM_GAIN', value: '-8.54 dB' },
      { id: 'REPLAYGAIN_ALBUM_PEAK', value: '0.999969' },
      { id: 'REPLAYGAIN_TRACK_GAIN', value: '-8.70 dB' },
      { id: 'REPLAYGAIN_TRACK_PEAK', value: '0.999969' },
      {
        id: 'METADATA_BLOCK_PICTURE',
        value: {
          type: 'Cover (front)',
          format: 'image/jpeg',
          description: '',
          width: 1413,
          height: 1389,
          colour_depth: 24,
          indexed_color: 0,
          data: <Buffer ff d8 ff e0 00 10 4a 46 49 46 00 01 01 00 00 01 00 01 00 00 ff fe 00 3e 43 52 45 41 54 4f 52 3a 20 67 64 2d 6a 70 65 67 20 76 31 2e 30 20 28 75 73 69 ... 120761 more bytes>
        }
      }
    ]
  },
  quality: { warnings: [] },
  common: {
    track: { no: 3, of: 13 },
    disk: { no: 2, of: null },
    movementIndex: {},
    artists: [ '2Pac' ],
    artist: '2Pac',
    title: "I Ain't Mad At Cha",
    album: 'Greatest Hits',
    year: 1998,
    date: '1998',
    genre: [ 'Rap', 'Hip Hop' ],
    albumartist: '2Pac',
    comment: [ ' YEAR: 1998' ],
    replaygain_album_gain: { dB: -8.54, ratio: 0.13995873225726185 },
    replaygain_album_peak: { dB: -0.0001346333762181356, ratio: 0.999969 },
    replaygain_track_gain: { dB: -8.7, ratio: 0.1348962882591654 },
    replaygain_track_peak: { dB: -0.0001346333762181356, ratio: 0.999969 },
    picture: [
      {
        type: 'Cover (front)',
        format: 'image/jpeg',
        description: '',
        width: 1413,
        height: 1389,
        colour_depth: 24,
        indexed_color: 0,
        data: <Buffer ff d8 ff e0 00 10 4a 46 49 46 00 01 01 00 00 01 00 01 00 00 ff fe 00 3e 43 52 45 41 54 4f 52 3a 20 67 64 2d 6a 70 65 67 20 76 31 2e 30 20 28 75 73 69 ... 120761 more bytes>
      }
    ]
  }
}


```

Looks like there are 4 main keys:
- format 
- native
- quality
- common

Looks like the default tags are in common and the ones added by Discogs are in native.vorbis

I'd like to start with using these tags from common:
- albumartist
- genre

I'd like to start with using these tags from vorbis:
- 'SOURCE COLLECTION'

