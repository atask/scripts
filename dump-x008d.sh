#!/bin/bash

folderdate=$(date +%Y%m%d)
backupdest=~/Downloads/dumps-x008d/dump-x008d-$folderdate

# backup recorded voice
adb pull -a /sdcard/AsusSoundRecorder $backupdest/asussoundrecorder

# backup whatsapp media (images, video, etc.)
adb pull -a /sdcard/WhatsApp/Media $backupdest/whatsapp

# backup photographs from internal sd card
adb pull -a /sdcard/DCIM/Camera $backupdest/sdcard

# backup screenshots
adb pull -a /sdcard/Screenshots $backupdest/screenshots
