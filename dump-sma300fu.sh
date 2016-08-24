#!/bin/bash

backupdest=~/Downloads/dumps-sma300fu
foldername=$(date +%Y%m%d)

# enter backup folder
cd $backupdest

# copy SMSBackupRestore incremental sms.xml and sms.xsl
adb pull -a /sdcard/SMSBackupRestore $backupdest/SMSBackupRestore_$foldername

# backup whatsapp databases and avatars
# adb shell calls with su need to use different location because of multi-user
# functionalities in Jelly Bean
# http://android.stackexchange.com/questions/39542/confused-by-the-many-locations-of-the-virtual-sdcard
adb shell "su -c mkdir /storage/emulated/0/temp_whatsapp"
adb shell "su -c cp /data/data/com.whatsapp/databases/msgstore.db /storage/emulated/0/temp_whatsapp/msgstore.db"
adb shell "su -c cp /data/data/com.whatsapp/databases/wa.db /storage/emulated/0/temp_whatsapp/wa.db"
adb shell "su -c cp -R /data/data/com.whatsapp/files/Avatars /storage/emulated/0/temp_whatsapp"
adb shell "su -c \"cp -R /data/data/com.whatsapp/cache/Profile\ Pictures /storage/emulated/0/temp_whatsapp\""
adb pull -a /storage/emulated/legacy/temp_whatsapp $backupdest/whatsapp_$foldername
adb shell "su -c rm -r /storage/emulated/0/temp_whatsapp"
mv $backupdest/whatsapp_$foldername/msgstore.db $backupdest/whatsapp_$foldername/msgstore_$foldername.db
mv $backupdest/whatsapp_$foldername/wa.db $backupdest/whatsapp_$foldername/wa_$foldername.db

# backup shazam databases
adb shell "su -c mkdir /storage/emulated/0/temp_shazam"
adb shell "su -c cp /data/data/com.shazam.android/databases/library.db /storage/emulated/0/temp_shazam/library.db"
adb pull -a /storage/emulated/legacy/temp_shazam $backupdest/shazam_$foldername
adb shell "su -c rm -r /storage/emulated/0/temp_shazam"
mv $backupdest/shazam_$foldername/library.db $backupdest/shazam_$foldername/shazam-library_$foldername.db

# backup whatsapp media
adb pull -a /sdcard/WhatsApp/Media $backupdest/whatsapp_$foldername/

# backup recordings from internal sd card
adb pull -a /sdcard/Sounds $backupdest/sounds_$foldername

# backup photographs from internal sd card
adb pull -a /sdcard/DCIM/Camera $backupdest/sdcard_$foldername

# backup pictures from internal sd card (screenshots)
adb pull -a /sdcard/Pictures/Screenshots $backupdest/screenshots_$foldername

# backup pictures from internal sd card (9GAG)
adb pull -a /sdcard/Pictures/9GAG $backupdest/9gag_$foldername

# backup downloads from internal sd card
adb pull -a /sdcard/Download $backupdest/downloads_$foldername
