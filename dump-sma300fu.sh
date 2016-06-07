#!/bin/bash

backupdest=~/Downloads/dumps-sma300fu
foldername=$(date +%Y%m%d)

# copy SMSBackupRestore incremental sms.xml and sms.xsl
mkdir -p $backupdest/SMSBackupRestore_$foldername
cd $backupdest/SMSBackupRestore_$foldername
adb pull /sdcard/SMSBackupRestore

# copy CallLogBackupRestore incremental calls.xml and calls.xsl
# -- discontinued =[ --
#mkdir -p $backupdest/CallLogBackupRestore_$foldername
#cd $backupdest/CallLogBackupRestore_$foldername
#adb pull /sdcard/CallLogBackupRestore

## OLD VERSION: NOT WORKING WITH ROOT ?!?
# backup shazam and decompress ab into tar
#mkdir -p $backupdest/shazam
#adb backup -f $backupdest/shazam/shazam_$foldername.ab -noapk com.shazam.android
#cd $backupdest/shazam
#dd if=shazam_$foldername.ab bs=24 skip=1 | python -c "import zlib,sys;sys.stdout.write(zlib.decompress(sys.stdin.read()))" > shazam_$foldername.tar
#rm shazam_$foldername.ab

## OLD VERSION: NOT WORKING WITH ROOT ?!?
# backup whatsapp and decompress ab into tar
#mkdir -p $backupdest/whatsapp/whatsapp_$foldername/
#adb backup -f $backupdest/whatsapp/whatsapp_$foldername/whatsapp_$foldername.ab -noapk com.whatsapp
#cd $backupdest/whatsapp/whatsapp_$foldername
#dd if=whatsapp_$foldername.ab bs=24 skip=1 | python -c "import zlib,sys;sys.stdout.write(zlib.decompress(sys.stdin.read()))" > whatsapp_$foldername.tar
#rm whatsapp_$foldername.ab

# backup whatsapp databases
# adb shell calls with su need to use different location because of multi-user
# functionalities in Jelly Bean
# http://android.stackexchange.com/questions/39542/confused-by-the-many-locations-of-the-virtual-sdcard
mkdir -p $backupdest/whatsapp_$foldername/
adb shell "su -c mkdir /storage/emulated/0/temp_whatsapp"
adb shell "su -c cp /data/data/com.whatsapp/databases/msgstore.db /storage/emulated/0/temp_whatsapp/msgstore.db"
adb shell "su -c cp /data/data/com.whatsapp/databases/wa.db /storage/emulated/0/temp_whatsapp/wa.db"
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

# backup whatsapp media (audio)
mkdir -p $backupdest/whatsapp-audio_$foldername
cd $backupdest/whatsapp-audio_$foldername
adb pull /sdcard/WhatsApp/Media/Whatsapp\ Audio

# backup whatsapp media (calls)
mkdir -p $backupdest/whatsapp-calls_$foldername
cd $backupdest/whatsapp-calls_$foldername
adb pull /sdcard/WhatsApp/Media/Whatsapp\ Calls

# backup whatsapp media (images)
mkdir -p $backupdest/whatsapp-images_$foldername
cd $backupdest/whatsapp-images_$foldername
adb pull /sdcard/WhatsApp/Media/Whatsapp\ Images

# backup whatsapp media (profile photos)
mkdir -p $backupdest/whatsapp-profile-photos_$foldername
cd $backupdest/whatsapp-profile-photos_$foldername
adb pull /sdcard/WhatsApp/Media/Whatsapp\ Profile\ Photos

# backup whatsapp media (video)
mkdir -p $backupdest/whatsapp-video_$foldername
cd $backupdest/whatsapp-video_$foldername
adb pull /sdcard/WhatsApp/Media/Whatsapp\ Video

# backup whatsapp media (voice notes)
mkdir -p $backupdest/whatsapp-voice-notes_$foldername
cd $backupdest/whatsapp-voice-notes_$foldername
adb pull /sdcard/WhatsApp/Media/Whatsapp\ Voice\ Notes

# backup whatsapp media (profile pictures)
mkdir -p $backupdest/whatsapp-profile-pictures_$foldername
cd $backupdest/whatsapp-profile-pictures_$foldername
adb pull /sdcard/WhatsApp/Profile\ Pictures

# backup recordings from internal sd card
mkdir -p $backupdest/sounds_$foldername/
cd $backupdest/sounds_$foldername/
adb pull /sdcard/Sounds/

# backup photographs from internal sd card
mkdir -p $backupdest/sdcard_$foldername/
cd $backupdest/sdcard_$foldername/
adb pull /sdcard/DCIM/Camera/

# OLD: no external sdcard available...
# backup photographs from external sd card
#mkdir -p $backupdest/extSdCard_$foldername/
#cd $backupdest/extSdCard_$foldername/
#adb pull /storage/extSdCard/DCIM/Camera/

# backup pictures from internal sd card (screenshots)
mkdir -p $backupdest/screenshots_$foldername/
cd $backupdest/screenshots_$foldername/
adb pull /sdcard/Pictures/Screenshots

# backup pictures from internal sd card (9GAG)
mkdir -p $backupdest/9gag_$foldername/
cd $backupdest/9gag_$foldername/
adb pull /sdcard/Pictures/9GAG
