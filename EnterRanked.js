// ==UserScript==
// @name         Enter Ranked
// @namespace    https://github.com/blissfulyoshi
// @version      1.0
// @description  Automate joining AMQ Ranked
// @author       You
// @match        https://animemusicquiz.com/*
// @grant        none
// ==/UserScript==

if (document.getElementById('loginUsername')){
	document.getElementById('loginUsername').value = "";
	document.getElementById('loginPassword').value = "";
	setTimeout(function () {login()}, 1000) //login() is a function built into AMQ
}

if(document.getElementById('loadingScreen')) {
    const mutationObserver = new MutationObserver(callback)
    mutationObserver.observe(document.getElementById('loadingScreen'),{ attributes: true })
}

// Use the built in event for AMQ ranked
new Listener("login complete", function (payload) {
    console.log(payload);
    setTimeout(()=>{
        if (enterRankedCounter < enterRankedLimit) {
            startScript();
        }
    },15000);
}).bindListener();

// Backup
setTimeout(()=>{
    if (enterRankedCounter < enterRankedLimit) {
        startScript();
    }
},40000);

const enterRankedLimit = 1
var enterRankedCounter = 0;

function startScript() {
    enterRankedCounter++;
    setTimeout(function () {
        enterRanked();
        updateTwitchData();
        adjustVolume();
    }, 2000)
}

function callback(mutationsList) {
    mutationsList.forEach(mutation => {
        if (mutation.attributeName === 'class') {
            if (mutation.target.classList.contains('hidden') && enterRankedCounter < enterRankedLimit && !document.getElementById('mainPage').classList.contains('hidden')) {
                //console.log("mutation done")
                startScript();
            }
        }
    })
}

//enter ranked and remove the ranked rules notification
function enterRanked(){
    if(ranked.currentState !== ranked.RANKED_STATE_IDS.RUNNING && ranked.currentState !== ranked.RANKED_STATE_IDS.CHAMP_RUNNING) {
        ranked.joinRankedLobby(ranked.RANKED_TYPE_IDS.NOVICE);
    } else {
        ranked.joinRankedGame(ranked.RANKED_TYPE_IDS.NOVICE);
    }
    setTimeout(()=>{swal.close();},10000);
}

// volumeController is a global AMQ variable for controlling volume
// set volume to 50% at the start of each game
function adjustVolume(){
    volumeController.volume = "0.9";
    volumeController.adjustVolume();
}

function updateTwitchData() {
	var header = {};
	header['Client-ID'] = '';
	header.Authorization = '';
	header['Content-Type'] = 'application/json';

    var broadcasterId = '';

    //sketchy way to calculate ranked dates
    var offset = -7;
    var shouldBeSafeTimeForRankedDate = new Date( new Date().getTime() + offset * 3600 * 1000);
    var rankedLocation = "East"
    if (shouldBeSafeTimeForRankedDate.getUTCHours() > 10) {
        rankedLocation = "Central"
    }
    if (shouldBeSafeTimeForRankedDate.getUTCHours() > 15) {
        rankedLocation = "West"
    }
    var formattedRankedDate = shouldBeSafeTimeForRankedDate.toISOString().split('T')[0];
    var streamTitle = 'AMQ Expert Ranked: ' + rankedLocation + ' ' + formattedRankedDate + ' (no mic)';

    //Update Twitch information
	var data = {
		game_id: '509058', // AMQ's game id
		title: streamTitle,
		broadcaster_language:"en"
	};

	var submitRequest = $.ajax({
		url: 'https://api.twitch.tv/helix/channels?broadcaster_id=' + broadcasterId,
		type: "patch",
		headers: header,
		data: JSON.stringify(data)
	});

	submitRequest.done(function (response, textStatus, jqXHR) {
		console.log(response);
	});
}
