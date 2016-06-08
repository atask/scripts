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
    getTags: callback => {
      shazamDb.all(tagQuery, (err, rows) => {
        if (err) return callback(err)
        if (rows.length === 0) return callback(null, rows, true)
        let isNewVersion = rows[0].tagid !== undefined
        return callback(null, rows, isNewVersion)
      })
    },
    // test if tracks table is available
    hasTracksTable: callback => {
      shazamDb.get(testTrackQuery, (err, row) => {
        if (err) return callback(err)
        if (row) return callback(null, true)
        callback(null, false)
      })
    },
    // get tracks
    getTracks: (hasTracksTable, callback) => {
      if (!hasTracksTable) return callback([])
      shazamDb.all(trackQuery, (err, rows) => {
        if (err) return callback(err)
        console.log('\t\tFound songs:')
        rows.forEach(row => console.log(`\t\t${row.title} - ${row.artist_name}`))
        callback(rows)
      })
    },
    processTags: (getTags, getTracks, callback) => {

    },
    closeDb: (processTags) => {
      shazamDb.close((err) => {
        if (err) callback(err)
        callback(null)
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
