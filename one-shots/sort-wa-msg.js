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

let targetDayISO = moment(TARGET_DAY, 'DD-MM-YYYY').format('Y-MM-DD')

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
      let contacts = rows.map(waContact.parse)
      callback(null, contacts)
    })
  },
  // get messages
  getMessages: (openMsgDb, callback) => {
    msgstore.all(msqQuery, (err, rows) => {
      if (err) return callback(err)
      let messages = rows.map(waMessage.parse)
      callback(null, messages)
    })
  },
  // convert contacts into a hash map
  createContactsMap: (getContacts, callback) => {
    let contactsMap = {}
    getContacts.forEach(contact => { contactsMap[contact.jid] = contact })
    callback(null, contactsMap)
  },
  // create snapshot (contacts and messages in a specific day)
  createSnapshot: (getMessages, createContactsMap, callback) => {
    let messages = getMessages
    let contactMap = createContactsMap
    let selectedContacts = {}
    // select only used contacts
    messages.forEach(message => {
      // actual contact that sent the message
      let fromContact = message.fromJid
        ? contactMap[message.fromJid]
        : null
      // group contact the message is stored into
      let groupContact = message.groupJid
        ? contactMap[message.groupJid]
        : null
      if (fromContact === null && groupContact === null) {
        return callback(`Message [${message.receivedTimestamp}] has no valid contact!`)
      }
      // add contact info if needed
      if (fromContact && !(fromContact.jid in selectedContacts)) {
        selectedContacts[fromContact.jid] = fromContact
      }
      if (groupContact && !(groupContact.jid in selectedContacts)) {
        selectedContacts[groupContact.jid] = groupContact
      }
    })
    // flatten selectedContacts map
    let selectedContactsArray = []
    Object.keys(selectedContacts).forEach(contact => {
      selectedContactsArray.push(selectedContacts[contact])
    })
    // debug
    console.log(`Parsed ${messages.length} messages on ${TARGET_DAY}:`)
    messages.forEach(message => {
      let previewText = message.type === waMessage.TEXT
        ? message.text.substring(0, 20)
        : ''
      console.log(`\t[${message.receivedTimestamp} - ${message.type}] ${previewText}`)
    })
    console.log(`Parsed ${selectedContactsArray.length} contacts:`)
    selectedContactsArray.forEach(contact => {
      console.log(`\t[${contact.jid}] ${contact.displayName}`)
    })
    waMap[targetDayISO] = {
      messages: getMessages,
      contacts: selectedContactsArray,
      reference: MSG_DB
    }
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
