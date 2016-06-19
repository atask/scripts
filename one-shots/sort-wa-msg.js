const sqlite3 = require('sqlite3')
const moment = require('moment')
const async = require('async')
const waMessage = require('squeeze').message
const waContact = require('squeeze').contact
const record = require('./record')

const OUT_FILE = 'wa.json'
let waMap = record.loadSync(OUT_FILE)

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
let contactsQuery = 'SELECT * FROM wa_contacts WHERE is_whatsapp_user=1'

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
      let contacts = rows.map(waContact.parse)
      contacts.forEach(contact => {
        console.log(`\t[${contact.jid}] ${contact.displayName}`)
      })
      callback(null, contacts)
    })
  },
  // get messages
  getMessages: (openMsgDb, callback) => {
    msgstore.all(msqQuery, (err, rows) => {
      if (err) return callback(err)
      console.log(`Found ${rows.length} messages on ${TARGET_DAY}:`)
      let messages = rows.map(waMessage.parse)
      messages.forEach(message => {
        console.log(`\t[${message.receivedTimestamp}] ${message.text}`)
      })
      callback(null, messages)
    })
  },
  // convert contacts into a hash map
  createContactsMap: (getContacts, callback) => {
    let contactsMap = {}
    getContacts.forEach(contact => { contactsMap[contact.jid] = contact })
    callback(null, contactsMap)
  },
  // merge chats/contacts info with messages
  mergeIntoMessage: (getMessages, createContactsMap, callback) => {
    getMessages.forEach(message => {
      let chat = createContactsMap[message.jid] || null
      let contact = createContactsMap[message.from] || null
      if (!contact) {
        return callback(`Message [${message.receivedTimestamp}] has no valid contact!`)
      }
      let key = `${message.receivedTimestamp}:${message.from}`
      message.from = contact.displayName || contact.waName
      message.chat = chat ? chat.displayName : null
      if (key in waMap) {
        return callback(`Message [${key}] is a dupe !?!`)
      }
      waMap[key] = message
    })
    callback(null)
  },
  // close message store db connection
  closeMsgDb: (getMessages, callback) => {
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
  else {
    record.dumpSync(OUT_FILE, waMap)
    console.log(`DONE! Saved ${Object.keys(waMap).length} entries`)
  }
})
