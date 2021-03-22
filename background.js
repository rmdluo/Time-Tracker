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