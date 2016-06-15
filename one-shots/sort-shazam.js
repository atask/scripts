const path = require('path')
const glob = require('glob')
const async = require('async')
const sqlite3 = require('sqlite3')
const record = require('./record')

const OUT_FILE = './out/shazam.json'
let songMap = record.loadSync(OUT_FILE)

// get dir index
let cwd = '/home/allan/Downloads/shazam'
let dbs = glob.sync('**/*.db', { cwd })
dbs.sort()

console.log('Collecting tracks:')
let shazamDb
let trackQuery = 'SELECT * FROM track'
let testTrackQuery = "SELECT name FROM sqlite_master WHERE type='table' AND name='track'"
let tagQuery = 'SELECT * FROM tag'
async.eachSeries(dbs, (db, callback) => {
  console.log(`\tparsing ${db}`)
  let dbPath = path.join(cwd, db)

  async.autoInject({
    // open db connection
    openDb: callback => {
      shazamDb = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
        if (err) callback(err)
        callback(null)
      })
    },
    // get tags
    getTags: (openDb, callback) => {
      shazamDb.all(tagQuery, (err, rows) => {
        if (err) return callback(err)
        if (rows.length === 0) return callback(null, rows, true)
        let isNewVersion = rows[0].tagid !== undefined
        return callback(null, rows, isNewVersion)
      })
    },
    // test if tracks table is available
    hasTracksTable: (openDb, callback) => {
      shazamDb.get(testTrackQuery, (err, row) => {
        if (err) return callback(err)
        if (row) return callback(null, true)
        callback(null, false)
      })
    },
    // get tracks
    getTracks: (hasTracksTable, callback) => {
      if (!hasTracksTable) return callback(null, null)
      shazamDb.all(trackQuery, (err, rows) => {
        if (err) return callback(err)
        console.log('\t\tFound songs:')
        callback(null, rows)
      })
    },
    processTags: (getTags, getTracks, callback) => {
      if (getTracks !== null) {
        // old version of shazam db
        getTracks.forEach(track => {
          let trackInfo = {
            key: track['_id'],
            title: track.title,
            artist: track.artist_name,
            cover: track.art_id,
            link: `http://www.shazam.com/track/${track['_id']}`
          }
          let key = trackInfo.key
          console.log(`\t\t${trackInfo.title} - ${trackInfo.artist} (${trackInfo.key})`)
          if (key in songMap) { return }
          songMap[key] = trackInfo
        })
      } else {
        // new version of shazam db
        let [tags] = getTags
        tags.forEach(tag => {
          let trackInfo
          if (tag.json) {
            let track = JSON.parse(tag.json).track
            // some jsons won't have any embedded info (!?!)
            trackInfo = {
              key: tag.track_key,
              title: track.heading ? track.heading.title : 'unknown title',
              artist: track.heading ? track.heading.subtitle : 'unknown artist',
              cover: track.images ? track.images.default : '',
              link: track.url ? track.url : `http://www.shazam.com/track/${tag.track_key}`
            }
          } else {
            trackInfo = {
              key: tag.track_key,
              title: 'unknown title',
              artist: 'unknown artist',
              cover: '',
              link: `http://www.shazam.com/track/${tag.track_key}`
            }
          }
          let key = trackInfo.key
          console.log(`\t\t${trackInfo.title} - ${trackInfo.artist} (${trackInfo.key})`)
          if (key in songMap) { return }
          songMap[key] = trackInfo
        })
      }
      callback()
    },
    closeDb: (processTags, callback) => {
      shazamDb.close((err) => {
        if (err) callback(err)
        callback()
      })
    }
  },
  err => {
    if (err) callback(err)
    callback(null)
  })
}, err => {
  if (err) console.log(err)
  else {
    record.dumpSync(OUT_FILE, songMap, 'key')
    console.log(`DONE! Saved ${Object.keys(songMap).length} entries`)
  }
})
