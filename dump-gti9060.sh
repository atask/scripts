#!/bin/bash
set -e

foldername=$(date +%Y%m%d)
backupdest=~/Downloads/dumps-gti9060/dump-gti9060-$foldername

mkdir -p $backupdest

# backup recorded voice
adb pull -a /sdcard/Sounds $backupdest/sounds_$foldername

# backup whatsapp media (images, video, etc.)
adb pull -a /sdcard/WhatsApp/Media $backupdest/whatsapp_$foldername

# backup photographs from internal sd card
adb pull -a /sdcard/DCIM/Camera $backupdest/sdcard_$foldername
