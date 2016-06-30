#!/usr/bin/env node
'use strict'

/*
Simple script that will change the PICS dir structure into the one I use
now...
*/

const glob = require('glob')
const prompt = require('prompt')
const mv = require('mv')
const async = require('async')
const path = require('path')
const moment = require('moment')

let cwd = process.cwd()
prompt.start();

console.log('Will start moving files from the current dir:')
console.log(`\t${cwd}`)

prompt.get({
  name: 'confirmation',
  required: true,
  default: 'n'
}
, (err, result) => {
  if (err) {
    console.error('ERROR: ' + err)
    process.exitCode = 1
  } else if (result.confirmation === 'y') {
    moveFiles()
  }
})

function moveFiles () {
  let files = glob.sync('**/*.jpg')
  console.log(`Found ${files.length} files`)

  async.series(files.map(src => {
    let fileName = path.basename(src)
    let dateStr = fileName.substring(0, 15)
    let date = moment(dateStr, 'YYYYMMDD-HHmmss')
    let dest = path.join(date.format('Y-[W]WW'), fileName)
    return moveFileFactory(src, dest)
  }),
    (err, results) => {
      if (err) {
        console.error('ERROR: ' + err)
        process.exitCode = 1
      } else {
        console.log('DONE...')
      }
    }
  )
}

function moveFileFactory (src, dest) {
  return callback => {
    mv(src, dest, {mkdirp: true}, err => {
      if (err) {
        callback(err)
      } else {
        console.log(`${src} -> ${dest}`)
        callback(null)
      }
    })
  }
}
