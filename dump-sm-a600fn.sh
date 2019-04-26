#!/bin/bash
set -e

foldername=$(date +%Y%m%d)
backupsrc=/storage/self/primary
backupdest=./dumps-sm-a600fn/dump-sm-a600fn-$foldername

mkdir -p $backupdest

# copy SMSBackupRestore incremental sms.xml and sms.xsl
adb pull -a $backupsrc/SMSBackupRestore $backupdest/SMSBackupRestore

# backup whatsapp media (images, video, etc.)
adb pull -a $backupsrc/WhatsApp/Media $backupdest/whatsapp

# backup recordings from internal sd card
adb pull -a $backupsrc/Voice\ Recorder $backupdest/voice-recorder

# backup photographs from internal sd card
adb pull -a $backupsrc/DCIM/Camera $backupdest/camera

# backup pictures from internal sd card (screenshots)
adb pull -a $backupsrc/DCIM/Screenshots $backupdest/screenshots

# backup pictures from internal sd card (9GAG)
adb pull -a $backupsrc/Pictures/9GAG $backupdest/9gag

# backup downloads from internal sd card
adb pull -a $backupsrc/Download $backupdest/download
