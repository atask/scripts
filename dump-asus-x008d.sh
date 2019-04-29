#!/bin/bash
set -e

folderdate=$(date +%Y%m%d)
backupsrc=/storage/self/primary
backupdest=./dumps-asus-x008d/dump-asus-x008d-$folderdate

mkdir -p $backupdest

# backup recorded voice
adb pull -a $backupsrc/AsusSoundRecorder $backupdest/asussoundrecorder

# backup whatsapp media (images, video, etc.)
adb pull -a $backupsrc/WhatsApp/Media $backupdest/whatsapp

# backup photographs from internal sd card
adb pull -a $backupsrc/DCIM/Camera $backupdest/camera

# backup screenshots
adb pull -a $backupsrc/Screenshots $backupdest/screenshots

# backup downloads from internal sd card
adb pull -a $backupsrc/Download $backupdest/download
