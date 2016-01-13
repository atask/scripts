shopt -s nocaseglob
files="*.mp4"
regex="creation_time   : (.*)$"
for f in $files
do
    buf=`avprobe $f 2>&1 | grep creation_time | head -1`
    [[ $buf =~ $regex ]]
    name="${BASH_REMATCH[1]}"
    if [ -n "$name" ]
    then
        name=${name//-}    # concatenate strings
        name=${name// /-}    # concatenate strings
        echo "$f -> ${name//:}.mp4"
        mv $f ${name//:}.mp4
    fi
    name="${name}.jpg"    # same thing stored in a variable
done
