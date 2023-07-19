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

Here is a sample of an mp3 result.

```json
{
  format: {
    tagTypes: [ 'ID3v2.4' ],
    trackInfo: [],
    lossless: false,
    container: 'MPEG',
    codec: 'MPEG 1 Layer 3',
    sampleRate: 44100,
    numberOfChannels: 2,
    bitrate: 128000,
    tool: 'LAME 3.97UU',
    codecProfile: 'CBR',
    numberOfSamples: 15743232,
    duration: 356.98938775510203
  },
  native: {
    'ID3v2.4': [
      [Object], [Object],
      [Object], [Object],
      [Object], [Object],
      [Object], [Object],
      [Object], [Object]
    ]
  },
  quality: {
    warnings: [
      [Object], [Object], [Object], [Object], [Object], [Object],
      [Object], [Object], [Object], [Object], [Object], [Object],
      [Object], [Object], [Object], [Object], [Object], [Object],
      [Object], [Object], [Object], [Object], [Object], [Object],
      [Object], [Object], [Object], [Object], [Object], [Object],
      [Object], [Object], [Object], [Object], [Object], [Object],
      [Object], [Object], [Object], [Object], [Object], [Object],
      [Object], [Object], [Object], [Object], [Object], [Object],
      [Object], [Object], [Object], [Object], [Object], [Object],
      [Object], [Object], [Object], [Object], [Object], [Object],
      [Object], [Object], [Object], [Object], [Object], [Object],
      [Object], [Object], [Object], [Object], [Object], [Object],
      [Object], [Object], [Object], [Object], [Object], [Object],
      [Object], [Object], [Object], [Object], [Object], [Object],
      [Object], [Object], [Object], [Object], [Object], [Object],
      [Object], [Object], [Object], [Object], [Object], [Object],
      [Object], [Object], [Object], [Object],
      ... 262 more items
    ]
  },
  common: {
    track: { no: null, of: null },
    disk: { no: null, of: null },
    movementIndex: {},
    rating: [ [Object] ],
    replaygain_album_gain: { dB: -7.68, ratio: 0.17060823890031235 },
    replaygain_album_peak: { dB: 1.310602017456501, ratio: 1.35226 },
    replaygain_track_gain: { dB: -4.1, ratio: 0.3890451449942806 },
    replaygain_track_peak: { dB: -0.18147429521166128, ratio: 0.959075 },
    title: 'Do It Again',
    artists: [ 'Steely Dan' ],
    artist: 'Steely Dan',
    comment: [ 'Probably Youtube' ],
    encodedby: 'Lavf52.31.0'
  }
}

```

native


```json
{
  'ID3v2.4': [
    { id: 'TXXX:CUSTOM TAG TEST', value: 'Hi' },
    { id: 'TXXX:replaygain_album_gain', value: '-7.68 dB' },
    { id: 'TXXX:replaygain_album_peak', value: '1.352260' },
    { id: 'TXXX:replaygain_track_gain', value: '-4.10 dB' },
    { id: 'TXXX:replaygain_track_peak', value: '0.959075' },
    { id: 'POPM', value: [Object] },
    { id: 'TXXX:PLAYLIST', value: 'main' },
    { id: 'TIT2', value: 'Do It Again' },
    { id: 'TPE1', value: 'Steely Dan' },
    { id: 'COMM', value: [Object] },
    { id: 'TENC', value: 'Lavf52.31.0' }
  ]
}

```
GRADE seems to work but RATING does not. SMH.

Vorbis:

```json
{
  vorbis: [
    { id: 'ARTIST', value: '2Pac' },
    { id: 'TITLE', value: 'Keep Ya Head Up' },
    { id: 'ALBUM', value: 'Greatest Hits' },
    { id: 'DATE', value: '1998' },
    { id: 'GENRE', value: 'Rap' },
    { id: 'GENRE', value: 'Hip Hop' },
    { id: 'ALBUMARTIST', value: '2Pac' },
    { id: 'TRACKNUMBER', value: '1' },
    { id: 'TRACKTOTAL', value: '12' },
    { id: 'DISCNUMBER', value: '1' },
    { id: 'COMMENT', value: 'www.RapMusicGuide.com\n' },
    { id: 'PLAYLIST', value: 'main' },
    { id: 'RATING', value: '5' },
    { id: 'SOURCE COLLECTION', value: '100' },
    { id: 'GRADE', value: 'A' },
    { id: 'REPLAYGAIN_ALBUM_GAIN', value: '-8.54 dB' },
    { id: 'REPLAYGAIN_ALBUM_PEAK', value: '0.999969' },
    { id: 'REPLAYGAIN_TRACK_GAIN', value: '-7.28 dB' },
    { id: 'REPLAYGAIN_TRACK_PEAK', value: '0.999969' },
    { id: 'METADATA_BLOCK_PICTURE', value: [Object] }
  ]
}

```

ID3:

```json
{
  'ID3v2.3': [
    { id: 'TRCK', value: '7' },
    { id: 'TXXX:GRADE', value: 'A' },
    { id: 'TXXX:replaygain_album_gain', value: '-7.79 dB' },
    { id: 'TXXX:replaygain_album_peak', value: '1.139966' },
    { id: 'TXXX:replaygain_track_gain', value: '-7.36 dB' },
    { id: 'TXXX:replaygain_track_peak', value: '1.139966' },
    { id: 'POPM', value: [Object] },
    { id: 'TXXX:PLAYLIST', value: 'main' },
    { id: 'TPE2', value: 'Snarky Puppy' },
    { id: 'TALB', value: 'Immigrance' },
    { id: 'TPE1', value: 'Snarky Puppy' },
    { id: 'COMM:iTunPGAP', value: [Object] },
    { id: 'COMM:iTunNORM', value: [Object] },
    { id: 'COMM:iTunSMPB', value: [Object] },
    { id: 'TENC', value: 'iTunes 12.8.0.150' },
    { id: 'TIT2', value: 'Bad Kids to the Back' },
    { id: 'TYER', value: '2019' },
    { id: 'APIC', value: [Object] }
  ],
  ID3v1: [
    { id: 'title', value: 'Bad Kids to the Back' },
    { id: 'artist', value: 'Snarky Puppy' },
    { id: 'album', value: 'Immigrance' },
    { id: 'track', value: 7 },
    { id: 'year', value: '2019' }
  ]
}

```


It appears that the common tag pulls data from STYLE automatically.

The GRADE-genre combination is not working for mp3s.

The combination tags are not working for any m4as. And somehow a bunch of album artist tags got deleted (possibly reverted through a Dropbox Error).

What does an m4a from itunes look like?

```json
{
  iTunes: [
    { id: 'trkn', value: '1/10' },
    { id: 'disk', value: '1/1' },
    { id: 'cpil', value: 0 },
    { id: '©day', value: '2018' },
    { id: 'sonm', value: 'Tatlı Diller Güler Yüze' },
    { id: '©nam', value: 'Tatlı Diller Güler Yüze' },
    {
      id: '----:com.apple.iTunes:replaygain_track_peak',
      value: '1.054197'
    },
    {
      id: '----:com.apple.iTunes:replaygain_track_gain',
      value: '-9.83 dB'
    },
    {
      id: '----:com.apple.iTunes:replaygain_album_peak',
      value: '1.112932'
    },
    {
      id: '----:com.apple.iTunes:replaygain_album_gain',
      value: '-9.66 dB'
    },
    { id: 'purd', value: '2020-02-10 23:48:09' },
    { id: '----:com.apple.iTunes:PLAYLIST', value: 'Turkish Music' },
    {
      id: '----:com.apple.iTunes:iTunSMPB',
      value: ' 00000000 00000840 000000AC 00000000006EE314 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000'
    },
    {
      id: '----:com.apple.iTunes:iTunNORM',
      value: ' 000011C7 00000E9D 000079E3 00008C81 00017B80 00017B80 00007E96 00007E9E 0000E3D9 00012BF4'
    },
    { id: '----:com.apple.iTunes:GRADE', value: 'A' },
    { id: '----:com.apple.iTunes:GENRE', value: 'Anatolian Rock' },
    { id: '----:com.apple.iTunes:GENRE', value: 'Turkish Folk' },
    { id: '----:com.apple.iTunes:GENRE', value: 'Psychedelic Rock' },
    { id: '----:com.apple.iTunes:GENRE', value: 'World' },
    { id: '©wrt', value: 'Neşet Ertaş' },
    { id: '©cmt', value: 'itunes date 2017-12-22T12:00:00Z' },
    { id: 'soar', value: 'Altın Gün' },
    { id: '©ART', value: 'Altın Gün' },
    { id: 'soal', value: 'On' },
    { id: 'aART', value: 'Altın Gün' },
    { id: '©alb', value: 'On' },
    { id: 'covr', value: [Object] },
    { id: 'pgap', value: 1 },
    { id: 'cnID', value: 1355691837 },
    { id: 'atID', value: 1230077237 },
    { id: 'cmID', value: 256821735 },
    { id: 'plID', value: 1355691432 },
    { id: 'geID', value: 20 },
    { id: 'stik', value: 1 }
  ]
}

```


OK. So we have keys and values like 
`{ id: '----:com.apple.iTunes:PLAYLIST', value: 'Turkish Music' },`

stored in the iTunes object.

I might be able to add steps to check for vorbis tags in m4as just like checking for them in mp3s.

Fixed the custom tags... but woof, looks like there is no "genre" key in iTunes tags??

Today is not the day to fix genre. But feeling pretty good about everything I care about except genre.