const sqlite3 = require('sqlite3')
const moment = require('moment')
const async = require('async')

const TARGET_DAY = '18-01-2016'
const MODE = 'test'
const WA_DB = 'msgstore_20160118.db'

let startLimit = moment(TARGET_DAY, 'DD-MM-YYYY').startOf('day').valueOf()
console.log(`startLimit: ${startLimit}`)
let endLimit = moment(TARGET_DAY, 'DD-MM-YYYY').endOf('day').valueOf()
console.log(`endLimit: ${endLimit}`)

console.log('Collecting messages:')

let msgstore
let msqQuery = `SELECT * FROM messages WHERE received_timestamp BETWEEN ${startLimit} AND ${endLimit} ORDER BY received_timestamp`

async.autoInject({
  // open db connection
  openDb: callback => {
    msgstore = new sqlite3.Database(WA_DB, sqlite3.OPEN_READONLY, (err) => {
      if (err) callback(err)
      callback(null)
    })
  },
  // get messages
  getMessages: (openDb, callback) => {
    msgstore.all(msqQuery, (err, rows) => {
      if (err) return callback(err)
      console.log(`Found ${rows.length} messages on ${TARGET_DAY}`)
      rows.forEach(message => {
        console.log(`\t[${message.received_timestamp}] ${message.data}`)
      })
      callback(null)
    })
  },
  // close db connection
  closeDb: (getMessages, callback) => {
    msgstore.close((err) => {
      if (err) callback(err)
      callback()
    })
  }
},
err => {
  if (err) console.log(`ERR: ${err}`)
  else console.log('DONE.')
})
