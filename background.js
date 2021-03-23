class Url {
	constructor(url, startTime){
		this.url = url;
		this.startTime = startTime;
	}

	get url() {
		return this._url;
	}

	set url(name){
		this._url = name;
	}

	get startTime() {
		return this._startTime;
	}

	set startTime(value){
		this._startTime = value;
	}
}

function trimUrl(url){
	url = url.substring(url.indexOf("//") + 2, url.length);
	url = url.substring(0, url.indexOf("/"));
	return url;
}

var active = false;
var pastUrl = "";
var currentUrl = "";
var startTime = Date.now();
var urls = []; // urls that have been read
var times = []; //time in seconds

function activate(){
	active = !active;

	if(active){
		chrome.tabs.query({
	  		active: true,
	  		currentWindow: true
		}, function(tabs) {
	 		var tab = tabs[0];
	 		currentUrl = trimUrl(tab.url)	;
	 		pastUrl = "";
			startTime = Date.now();
			urls = []; // urls that have been read
			times = []; //time in seconds
	 		if(!urls.includes(currentUrl)){
					urls.push(currentUrl);
					times.push(0);
			}
		});
	}
}

chrome.runtime.onMessage.addListener(activate);

function handleUpdated(tabId, changeInfo, tabInfo){
	if(active){
		if(changeInfo.url){
			if(currentUrl !== ""){
				var index = urls.indexOf(currentUrl);
				times[index] = times[index] + (Date.now() - startTime) / 1000;
			}

			pastUrl = currentUrl;
			startTime = Date.now();
			currentUrl = trimUrl(changeInfo.url);

			if(!urls.includes(currentUrl)){
				urls.push(currentUrl);
				times.push(0);
			}
		}
	}
}

chrome.tabs.onUpdated.addListener(handleUpdated);

function handleActivated(activeInfo){
	if(active){
		if(activeInfo.tabId){
			chrome.tabs.query({
	  			active: true,
	  			currentWindow: true
			}, function(tabs) {
				if(currentUrl !== ""){
					var index = urls.indexOf(currentUrl);
					times[index] = times[index] + (Date.now() - startTime) / 1000;
				}

	  			var tab = tabs[0];
				var url = tab.url;
				pastUrl = currentUrl;
				startTime = Date.now();
				currentUrl = trimUrl(url)	;
				
				if(!urls.includes(currentUrl)){
					urls.push(currentUrl);
					times.push(0);
				}
			});		
		}
	}
}

chrome.tabs.onActivated.addListener(handleActivated);

var blockedSites = {};
//var specificUrls = {};

getBlockedSites();

function getBlockedSites() {
	blockedSites = {};
	chrome.storage.sync.get("settings", function(data) {
		var blockedSitesText = data.settings;
		console.log(blockedSitesText);
		if(blockedSitesText != null){
			var blockedSitesArray = blockedSitesText.split("\n");
			console.log(blockedSitesArray[0]);
			for(let blockedSiteIndex in blockedSitesArray) {
				let blockedSite = blockedSitesArray[blockedSiteIndex];
				if(blockedSite != null){
					var blockedSiteInfo = blockedSite.split(",");
					console.log(blockedSite);
					blockedSites[blockedSiteInfo[0]] = blockedSiteInfo[1];
				}
			}
		}
	});
}

function handleSettingsChanged(changes) {
	getBlockedSites();
}

chrome.storage.onChanged.addListener(handleSettingsChanged);

function checkBlocked() {
	if(active){
		// chrome.tabs.query({
	 //  		active: true,
	 //  		currentWindow: true
		// }, function(tabs) {
	 // 		let tab = tabs[0];
	 // 		let url = trimUrl(tab.url);
	 		if(blockedSites[currentUrl]) {
	 			var index = urls.indexOf(currentUrl);
	 			var timeArray = blockedSites[currentUrl].split(":");
	 			console.log(startTime);
	 			console.log(Date.now());
	 			console.log(times[index]);
	 			if(Date.now() - startTime + times[index] * 1000 >= parseInt(timeArray[0]) * 3600000 + parseInt(timeArray[1]) * 60000 + parseInt(timeArray[2]) * 1000) {
	 				console.log(Date.now() - startTime + times[index]);
	 				console.log("blocked");
	 				chrome.tabs.update({url: chrome.extension.getURL('blocked.html')});
	 			}
	 		}
		// });
	}
}

setInterval(checkBlocked, 1000);
