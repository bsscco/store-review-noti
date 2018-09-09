console.log(new Date().toTimeString());

const fs = require('fs');
const config = JSON.parse(fs.readFileSync(__dirname + '/config.json'));
const APP_ACCESS_TOKEN = config.app_access_token;
const SLACK_REVIEW_CHANNEL_ID = config.slack_store_review_channel_id;
const SLACK_CRITIAL_REVIEW_CHANNEL_ID = config.slack_store_critical_review_channel_id;
const SLACK_TEST_CHANNEL_ID = config.slack_test_channel_id;
const APP_PACKAGE_NAME = config.app_package_name;

const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const moment = require('moment');
const path = require('path');
const JsonDB = require('node-json-db');
const db = new JsonDB("review-db", true, true);
const {google} = require('googleapis');

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.status(200).send('Hello, store-review-noti!').end();
});

app.get('/notify-new-review', (req, res) => {
    res.sendStatus(200);

    const filteredReviewList = [];
    const filteredReviewListCritical = [];
    console.log('getAccessToken');
    getAccessToken()
        .then(res => {
            console.log('getLatestReviewList');
            return getLatestReviewList(10, tokenStorage.access_token);
        })
        .then(res => {
            const data = db.getData('/');
            res.data.reviews.filter(rd => {
                if (!(rd.reviewId in data)) {
                    filteredReviewList.push(rd);
                    if (rd.comments[0].userComment.starRating <= 2) {
                        filteredReviewListCritical.push(rd);
                    }
                    db.push('/' + rd.reviewId, '')
                    return true;
                } else {
                    return false;
                }
            });
            console.log('sendMsg');
            return sendMsg('', makeReviewMsgPayload(SLACK_REVIEW_CHANNEL_ID, filteredReviewList));
        })
        .then(res => sendMsg('', makeReviewMsgPayload(SLACK_CRITIAL_REVIEW_CHANNEL_ID, filteredReviewListCritical)))
        .then(res => console.log(res.data))
        .catch(err => console.log(err.message));
});

const tokenStorage = {
    access_token: null,
    token_type: null,
    expiry_date: null
};

function getAccessToken() {
    return new Promise(function (resolve, reject) {
        const jwt = new google.auth.JWT(
            null,
            path.join(__dirname, 'api-5470769708148396614-478778-1b0ffbf69881.json'), //키 파일의 위치
            null,
            ['https://www.googleapis.com/auth/androidpublisher'], //scope
            ''
        );

        jwt.authorize(function (err, tokens) {
            if (err) {
                reject(err)
                return;
            }
            tokenStorage.access_token = tokens.access_token;
            tokenStorage.token_type = tokens.token_type;
            tokenStorage.expiry_date = tokens.expiry_date;
            resolve();
        });
    });
}

function getLatestReviewList(limit, accessToken, nextPageToken) {
    let url = 'https://www.googleapis.com/androidpublisher/v2/applications/' + APP_PACKAGE_NAME + '/reviews?';
    url += 'maxResults=' + limit;
    url += '&access_token=' + accessToken;
    if (nextPageToken) {
        url += '&token=' + nextPageToken;
    }
    return axios.get(url);
}

function makeReviewMsgPayload(slackChannelId, reviewList) {
    const attachments = [];
    reviewList.map(rd => {
        text = '';
        text += '\n' + rd.authorName;
        text += '\n' + moment(rd.comments[0].userComment.lastModified.seconds * 1000).format('YYYY-MM-DD hh시mm분ss초');
        text += '\n' + rd.comments[0].userComment.text.trim();
        attachments.push({
            title: rd.comments[0].userComment.starRating + '점',
            text,
            color: '#35c5f0'
        })
    });
    return {
        channel: slackChannelId,
        attachments
    };
}

function sendMsg(responseUrl, payload) {
    return axios.post(responseUrl ? responseUrl : 'https://slack.com/api/chat.postMessage', JSON.stringify(payload), {
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + APP_ACCESS_TOKEN
        }
    });
}

// Start the server
const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
});