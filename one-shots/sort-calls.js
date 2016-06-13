const fs = require('fs')
const path = require('path')
const glob = require('glob')
const async = require('async')
const xml2js = require('xml2js')

let callsMap = {}

// get dir index
let cwd = '/home/allan/Downloads'
let xmls = glob.sync('{SMSBackupRestore/SMSBackupRestore_*,CallLogBackupRestore/CallLogBackupRestore_*}/calls.xml', { cwd })
xmls.sort((first, second) => {
  let dateRegex = /_(\d+)\//
  let firstDateIndex = first.match(dateRegex)[1]
  let secondDateIndex = second.match(dateRegex)[1]
  return firstDateIndex - secondDateIndex
})

console.log('Collecting calls:')
async.eachSeries(xmls, (xml, callback) => {
  console.log(`\tExtracting from ${xml}:`)
  let xmlPath = path.join(cwd, xml)
  fs.readFile(xmlPath, (err, xmlData) => {
    if (err) return callback(err)
    let parser = new xml2js.Parser()
    parser.parseString(xmlData, (err, callsData) => {
      if (err) return callback(err)
      let calls = callsData.calls.call
      console.log(`\t\tFound ${calls.length} calls`)
      calls.forEach(call => {
        let callData = call.$
        let callHash = `${callData.date}_${callData.number}_${callData.type}`
        if (callHash in callsMap) { return }
        callsMap[callHash] = callData
      })
      callback(null)
    })
  })
}, err => {
  if (err) console.log(err)
  else console.log('DONE! ' + Object.keys(callsMap).length)
})
