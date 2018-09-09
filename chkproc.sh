daemon=`netstat -tlnp | grep :::9000 | wc -l`
if [ "$daemon" -eq "0" ] ; then
        nohup node /home/bsscco/store-review-noti/app.js &
fi