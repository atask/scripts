#!/bin/bash

backupdest=~/Downloads/dumps-gti9301i
foldername=$(date +%Y%m%d)

# backup recorded voice
adb pull -a /sdcard/Sounds $backupdest/sounds_$foldername

# backup whatsapp media (images, video, etc.)
adb pull -a /sdcard/WhatsApp/Media $backupdest/whatsapp_$foldername

# backup photographs from internal sd card
adb pull -a /sdcard/DCIM/Camera $backupdest/sdcard_$foldername
