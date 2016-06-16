const sqlite3 = require('sqlite3')
const moment = require('moment')
const async = require('async')
const waMessage = require('squeeze').message
const waChat = require('squeeze').chat
const waContact = require('squeeze').contact

const TARGET_DAY = '15-06-2016'
// const MODE = 'test'
const MSG_DB = 'msgstore_20160615.db'
const WA_DB = 'wa_20160615.db'

let startLimit = moment(TARGET_DAY, 'DD-MM-YYYY').startOf('day').valueOf()
console.log(`startLimit: ${startLimit}`)
let endLimit = moment(TARGET_DAY, 'DD-MM-YYYY').endOf('day').valueOf()
console.log(`endLimit: ${endLimit}`)

console.log('Collecting messages:')

let msgstore
let wastore
let msqQuery = `SELECT * FROM messages WHERE received_timestamp BETWEEN ${startLimit} AND ${endLimit} ORDER BY received_timestamp`
let contactsQuery = 'SELECT * FROM wa_contacts WHERE is_whatsapp_user=1 AND jid NOT LIKE "%-%"'
let chatsQuery = 'SELECT * FROM chat_list'

async.autoInject({
  // open message store db connection
  openMsgDb: callback => {
    msgstore = new sqlite3.Database(MSG_DB, sqlite3.OPEN_READONLY, (err) => {
      if (err) callback(err)
      callback(null)
    })
  },
  // open wa db connection
  openWaDb: callback => {
    wastore = new sqlite3.Database(WA_DB, sqlite3.OPEN_READONLY, (err) => {
      if (err) callback(err)
      callback(null)
    })
  },
  // get contacts
  getContacts: (openWaDb, callback) => {
    wastore.all(contactsQuery, (err, rows) => {
      if (err) return callback(err)
      console.log(`Found ${rows.length} contacts:`)
      rows.forEach(contact => {
        let parsed = waContact.parse(contact)
        console.log(`\t[${parsed.jid}] ${parsed.displayName}`)
      })
      callback(null)
    })
  },
  // get chats
  getChats: (openMsgDb, callback) => {
    msgstore.all(chatsQuery, (err, rows) => {
      if (err) return callback(err)
      console.log(`Found ${rows.length} chats:`)
      rows.forEach(chat => {
        let parsed = waChat.parse(chat)
        console.log(`\t[${parsed.jid}] ${parsed.subject}`)
      })
      callback(null)
    })
  },
  // get messages
  getMessages: (openMsgDb, callback) => {
    msgstore.all(msqQuery, (err, rows) => {
      if (err) return callback(err)
      console.log(`Found ${rows.length} messages on ${TARGET_DAY}:`)
      rows.forEach(message => {
        let parsed = waMessage.parse(message)
        console.log(`\t[${parsed.receivedTimestamp}] ${parsed.text}`)
      })
      callback(null)
    })
  },
  // close message store db connection
  closeMsgDb: (getChats, getMessages, callback) => {
    msgstore.close((err) => {
      if (err) callback(err)
      callback(null)
    })
  },
  // close wa db connection
  closeWaDb: (getContacts, callback) => {
    wastore.close((err) => {
      if (err) callback(err)
      callback(null)
    })
  }
},
err => {
  if (err) console.log(`ERR: ${err}`)
  else console.log('DONE.')
})
