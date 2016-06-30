#!/usr/bin/env node
'use strict'

/*
Simple script that will change the WA dir structure into the one I use
now...
*/

const argv = require('minimist')(process.argv.slice(2))
const mv = require('mv')

let day = argv.d || argv.day
let sources = [
  'whatsapp-audio_',
  'whatsapp-calls_',
  'whatsapp-images_',
  'whatsapp-profile-photos_',
  'whatsapp-profile-pictures_',
  'whatsapp-profile-video_',
  'whatsapp-profile-voice-notes_'
]
let dests = [
  'whatsapp_XXX/Media/WhatsApp Audio',
  'whatsapp_XXX/Media/WhatsApp Calls',
  'whatsapp_XXX/Media/WhatsApp Images',
  'whatsapp_XXX/Media/WhatsApp Profile Photos',
  'whatsapp_XXX/Media/WhatsApp Profile Pictures',
  'whatsapp_XXX/Media/WhatsApp Video',
  'whatsapp_XXX/Media/WhatsApp Voice Notes'
]

if (day) {
  console.log('MOVING:')
  Promise.all(() => {
    return sources.map((source, index) => {
      return new Promise((resolve, reject) => {
        let src = source + day
        let dest = dests[index].replace('XXX', day)
        console.log(`\t${src} -> ${dest}`)
        mv(src, dest, {mkdirp: true}, err => {
          err ? reject(err) : resolve()
        })
      })
    })
  }).then(() => {
    console.log('DONE...')
  }).catch(err => {
    console.log('ERROR: ' + err)
  })
} else {
  console.log('wrong day value')
}
