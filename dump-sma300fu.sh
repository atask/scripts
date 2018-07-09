#!/bin/bash
set -e

foldername=$(date +%Y%m%d)
backupdest=./dumps-sma300fu/dump-sma300fu-$foldername

mkdir -p $backupdest

# copy SMSBackupRestore incremental sms.xml and sms.xsl
adb pull -a /sdcard/SMSBackupRestore $backupdest/SMSBackupRestore

# backup whatsapp databases and avatars
# adb shell calls with su need to use different location because of multi-user
# functionalities in Jelly Bean
# http://android.stackexchange.com/questions/39542/confused-by-the-many-locations-of-the-virtual-sdcard
adb shell "su -c mkdir /sdcard/temp_whatsapp"
adb shell "su -c cp /data/data/com.whatsapp/databases/msgstore.db /sdcard/temp_whatsapp/msgstore.db"
adb shell "su -c cp /data/data/com.whatsapp/databases/wa.db /sdcard/temp_whatsapp/wa.db"
adb shell "su -c cp -R /data/data/com.whatsapp/files/Avatars /sdcard/temp_whatsapp"
adb shell "su -c \"cp -R /data/data/com.whatsapp/cache/Profile\ Pictures /sdcard/temp_whatsapp\""
adb pull -a /sdcard/temp_whatsapp $backupdest/whatsapp
adb shell "su -c rm -r /sdcard/temp_whatsapp"

# backup shazam databases
adb shell "su -c mkdir /sdcard/temp_shazam"
adb shell "su -c cp /data/data/com.shazam.android/databases/library.db /sdcard/temp_shazam/library.db"
adb pull -a /storage/emulated/legacy/temp_shazam $backupdest/shazam
adb shell "su -c rm -r /sdcard/temp_shazam"

# backup whatsapp media
adb pull -a /sdcard/WhatsApp/Media $backupdest/whatsapp

# backup recordings from internal sd card
adb pull -a /sdcard/Sounds $backupdest/sounds

# backup photographs from internal sd card
adb pull -a /sdcard/DCIM/Camera $backupdest/sdcard

# backup pictures from internal sd card (screenshots)
adb pull -a /sdcard/Pictures/Screenshots $backupdest/screenshots

# backup pictures from internal sd card (9GAG)
adb pull -a /sdcard/Pictures/9GAG $backupdest/9gag

# backup downloads from internal sd card
adb pull -a /sdcard/Download $backupdest/downloads
