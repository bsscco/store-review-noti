# store-review-noti
플레이스토어 리뷰를 폴링방식으로 가져와서 슬랙에 알림 보내기

### 참고
- Google API Auth JWT(http://totuworld.github.io/2016/02/12/jwt)

### crontab
- ```chmod 777 chkproc.sh```
- ```* * * * * /home/bsscco/store-review-noti/chkproc.sh > /home/bsscco/store-review-noti/crontab-chkproc.log 2>&1```
- ```*/10 * * * * curl localhost:9000/notify-new-review > /home/bsscco/store-review-noti/crontab-curl.log 2>&1```
