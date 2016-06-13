const fs = require('fs')
const path = require('path')
const glob = require('glob')
const async = require('async')
const xml2js = require('xml2js')

let smsMap = {}

// get dir index
let cwd = '/home/allan/Downloads/SMSBackupRestore'
let xmls = glob.sync('**/sms.xml', { cwd })
xmls.sort()

console.log('Collecting sms:')
async.eachSeries(xmls, (xml, callback) => {
  let xmlPath = path.join(cwd, xml)
  console.log(`\tExtracting from ${xml}:`)
  fs.readFile(xmlPath, (err, xmlData) => {
    if (err) return callback(err)
    let parser = new xml2js.Parser()
    parser.parseString(xmlData, (err, smsesData) => {
      if (err) return callback(err)
      let smses = smsesData.smses.sms
      console.log(`\t\tFound ${smses.length} sms`)
      smses.forEach(sms => {
        let smsData = sms.$
        let smsHash = `${smsData.date}_${smsData.address}_${smsData.type}`
        if (smsHash in smsMap) { return }
        smsMap[smsHash] = smsData
      })
      callback(null)
    })
  })
}, err => {
  if (err) console.log(err)
  else console.log('DONE! ' + Object.keys(smsMap).length)
})
