var blockedSites = document.getElementById("blockedSites");

chrome.storage.sync.get("settings", function(data){
	this.settings = data.settings;
	if(this.settings != null){
		blockedSites.value = this.settings;
	}
});

document.getElementById("save").onclick = function() {
	chrome.storage.sync.set({"settings": blockedSites.value});
};