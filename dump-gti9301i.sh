#!/bin/bash

backupdest=~/Downloads/dumps-gti9301i
foldername=$(date +%Y%m%d)

# backup recorded voice
mkdir -p $backupdest/sounds_$foldername/
cd $backupdest/sounds_$foldername
adb pull /sdcard/Sounds

# backup whatsapp media (images, video, etc.)
mkdir -p $backupdest/whatsapp_$foldername/
cd $backupdest/whatsapp_$foldername
adb pull /sdcard/WhatsApp/Media

# backup photographs from internal sd card
mkdir -p $backupdest/sdcard_$foldername/
cd $backupdest/sdcard_$foldername
adb pull /sdcard/DCIM/Camera
