const path = require('path')
const glob = require('glob')
const async = require('async')
const sqlite3 = require('sqlite3')

let songs = {}

// get dir index
let cwd = '/home/allan/Downloads/shazam'
let dbs = glob.sync('**/*.db', { cwd })
dbs.sort()

console.log('Collecting tracks:')
let shazamDb
let trackQuery = 'SELECT * FROM track'
let testTrackQuery = "SELECT name FROM sqlite_master WHERE type='table' AND name='track'"
let tagQuery = 'SELECT json FROM tag'
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
            title: track.title,
            artist: track.artist_name,
            cover: track.art_id,
            link: `http://www.shazam.com/track/${track.key}`
          }
          let id = `${trackInfo.title}-${trackInfo.artist}`
          console.log(`\t\t${trackInfo.title} - ${trackInfo.artist}`)
          if (id in songs) { return }
          songs[id] = trackInfo
        })
      } else {
        // new version of shazam db
        let [tags] = getTags
        tags.forEach(tag => {
          if (tag.json) {
            let track = JSON.parse(tag.json).track
            let trackInfo = {
              title: track.heading.title,
              artist: track.heading.subtitle,
              cover: track.images.default,
              link: track.url
            }
            let id = `${trackInfo.title}-${trackInfo.artist}`
            console.log(`\t\t${trackInfo.title} - ${trackInfo.artist}`)
            if (id in songs) { return }
            songs[id] = trackInfo
          }
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
  else console.log('DONE!')
})
