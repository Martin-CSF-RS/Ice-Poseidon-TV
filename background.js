const CHANNEL_ID = 'UCv9Edl_WbtbPeURPtFDo-uA',
    INTERVAL = 1000 * 30, // 30 second interval
    DEFAULT_ICON_PATH = './icons/128.png',
    LIVE_ICON_PATH = './icons/128-green.png',
    soundEffect = new Audio('online.mp3'),
    lastNotification = null;

let currentIconPath = DEFAULT_ICON_PATH;

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

    var response = {};

    for (var i = 0; i < request.items.length; i++) {
        response[request.items[i]] = JSON.parse(localStorage[request.items[i]]);
    }

    sendResponse({
        data: response,
        BTTVChannels: localStorage['BTTVChannels'],
        disableAvatars: JSON.parse(localStorage['disableAvatars']),
        enableChatColors: JSON.parse(localStorage['enableChatColors']),
        redirectToYTGaming: JSON.parse(localStorage['redirectToYTGaming']),
        enableSplitChat: JSON.parse(localStorage['enableSplitChat']),
        showDeletedMessages: JSON.parse(localStorage['showDeletedMessages'])
    });
});

chrome.notifications.onClicked.addListener(function(notificationId) {
 	if(notificationId == 'liveNotification') {
 		chrome.tabs.create({ url: 'https://gaming.youtube.com/ice_poseidon/live' });
		chrome.notifications.clear(notificationId);
    }
});

var showNotification = function () {

    var time = /(..)(:..)/.exec(new Date());
    var hour = time[1] % 12 || 12;
    var period = time[1] < 12 ? 'AM' : 'PM';

    // Temp fix to prevent notification spam
    if (((Date.now() - lastNotification) >= (1000 * 60 * 30)) && (lastNotification !== null)) {
        return ;
    }

    lastNotification = Date.now();

    if (JSON.parse(localStorage.isActivated) === true) {

        chrome.notifications.create('liveNotification', {
 			type: 'basic',
 			title: 'Live! (' + hour + time[2] + ' ' + period + ')',
 			message: 'Ice Poseidon has started streaming.',
 			contextMessage: 'Ice Poseidon TV',
 			iconUrl: LIVE_ICON_PATH
  		});
    }

    if (JSON.parse(localStorage.notificationSoundEnabled) === true) {

        if (localStorage.getItem('audio') === null) {

            var defaultSound = new Audio('online.mp3');
            var volume = (localStorage.notificationVolume / 100);

            defaultSound.volume = (typeof volume == 'undefined' ? 0.50 : volume);
            defaultSound.play();

        } else {

            var encodedAudio = localStorage.getItem('audio');
            var arrayBuffer = base64ToArrayBuffer(encodedAudio);

            createSoundWithBuffer(arrayBuffer);
        }
    }
};

var updateIcon = function () {

    const isLive = JSON.parse(localStorage.isLive) === true;

    const iconPath = isLive ? LIVE_ICON_PATH : DEFAULT_ICON_PATH;

    if (iconPath !== currentIconPath) {
        currentIconPath = iconPath;
        chrome.browserAction.setIcon({
            path: currentIconPath
        });
    }
};

var checkIfLive = function () {

    $.get('http://107.170.95.160/live', function (data) {
        if (data['status'] === true) {
            if (JSON.parse(localStorage.isLive) === false) {
                showNotification();
                localStorage.isLive = true;
            }
        } else {
            localStorage.isLive = false;
        }

        updateIcon();
    });
};

if (window.Notification) {
    setInterval(function () {
        checkIfLive();
    }, INTERVAL);
};

if (!localStorage.isLive) localStorage.isLive = false;
if (!localStorage.isActivated) localStorage.isActivated = true;
if (!localStorage.notificationSoundEnabled) localStorage.notificationSoundEnabled = true;
if (!localStorage.notificationVolume) localStorage.notificationVolume = 50;
if (!localStorage.showRecentTweet) localStorage.showRecentTweet = true;
if (!localStorage.emotesTwitch) localStorage.emotesTwitch = true;
if (!localStorage.emotesBTTV) localStorage.emotesBTTV = true;
if (!localStorage.emotesSub) localStorage.emotesSub = true;
if (!localStorage.BTTVChannels) localStorage.BTTVChannels = 'Ice_Poseidon, monkasen, graphistrs, trihex, reckful, b0aty, NightDev';
if (!localStorage.disableAvatars) localStorage.disableAvatars = true;
if (!localStorage.enableChatColors) localStorage.enableChatColors = true;
if (!localStorage.redirectToYTGaming) localStorage.redirectToYTGaming = true;
if (!localStorage.enableSplitChat) localStorage.enableSplitChat = false;
if (!localStorage.showDeletedMessages) localStorage.showDeletedMessages = false;

if (localStorage.BTTVChannels) {
    localStorage.BTTVChannels = localStorage.BTTVChannels.replace('MonkaSenpai', 'monkasen');
}

checkIfLive();
