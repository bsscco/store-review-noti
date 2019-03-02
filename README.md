# store-review-noti
Notification tool that notify Google play store reviews to the Slack per 5 minutes.

### To use Google Auth API, I got help from belowed link.
- Google API Auth JWT(http://totuworld.github.io/2016/02/12/jwt)

### Crontab for restarting when process killed.
- ```chmod 777 chkproc.sh```
- ```* * * * * /home/bsscco/store-review-noti/chkproc.sh > /home/bsscco/store-review-noti/crontab-chkproc.log 2>&1```
- ```*/10 * * * * curl localhost:9000/notify-new-review > /home/bsscco/store-review-noti/crontab-curl.log 2>&1```
