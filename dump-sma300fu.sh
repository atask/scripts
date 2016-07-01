#!/bin/bash

backupdest=~/Downloads/dumps-sma300fu
foldername=$(date +%Y%m%d)

# copy SMSBackupRestore incremental sms.xml and sms.xsl
mkdir -p $backupdest/SMSBackupRestore_$foldername
cd $backupdest/SMSBackupRestore_$foldername
adb pull /sdcard/SMSBackupRestore

# backup whatsapp databases and avatars
# adb shell calls with su need to use different location because of multi-user
# functionalities in Jelly Bean
# http://android.stackexchange.com/questions/39542/confused-by-the-many-locations-of-the-virtual-sdcard
mkdir -p $backupdest/whatsapp_$foldername/
adb shell "su -c mkdir /storage/emulated/0/temp_whatsapp"
adb shell "su -c cp /data/data/com.whatsapp/databases/msgstore.db /storage/emulated/0/temp_whatsapp/msgstore.db"
adb shell "su -c cp /data/data/com.whatsapp/databases/wa.db /storage/emulated/0/temp_whatsapp/wa.db"
adb shell "su -c cp -R /data/data/com.whatsapp/files/Avatars /storage/emulated/0/temp_whatsapp"
adb shell "su -c \"cp -R /data/data/com.whatsapp/cache/Profile\ Pictures /storage/emulated/0/temp_whatsapp\""
cd $backupdest/whatsapp_$foldername
adb pull /storage/emulated/legacy/temp_whatsapp
mv msgstore.db msgstore_$foldername.db
mv wa.db wa_$foldername.db
adb shell "su -c rm -r /storage/emulated/0/temp_whatsapp"

# backup shazam databases
mkdir -p $backupdest/shazam_$foldername/
adb shell "su -c mkdir /storage/emulated/0/temp_shazam"
adb shell "su -c cp /data/data/com.shazam.android/databases/library.db /storage/emulated/0/temp_shazam/library.db"
cd $backupdest/shazam_$foldername
adb pull /storage/emulated/legacy/temp_shazam
mv library.db shazam-library_$foldername.db
adb shell "su -c rm -r /storage/emulated/0/temp_shazam"

# backup whatsapp media
mkdir -p $backupdest/whatsapp_$foldername/Media
cd $backupdest/whatsapp_$foldername/Media
adb pull /sdcard/WhatsApp/Media

# backup recordings from internal sd card
mkdir -p $backupdest/sounds_$foldername/
cd $backupdest/sounds_$foldername/
adb pull /sdcard/Sounds

# backup photographs from internal sd card
mkdir -p $backupdest/sdcard_$foldername/
cd $backupdest/sdcard_$foldername/
adb pull /sdcard/DCIM/Camera

# backup pictures from internal sd card (screenshots)
mkdir -p $backupdest/screenshots_$foldername/
cd $backupdest/screenshots_$foldername/
adb pull /sdcard/Pictures/Screenshots

# backup pictures from internal sd card (9GAG)
mkdir -p $backupdest/9gag_$foldername/
cd $backupdest/9gag_$foldername/
adb pull /sdcard/Pictures/9GAG

# backup downloads from internal sd card
mkdir -p $backupdest/downloads_$foldername/
cd $backupdest/downloads_$foldername/
adb pull /sdcard/Download
