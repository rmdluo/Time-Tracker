var blockedSites = document.getElementById("blockedSites");

function getSettings() {
	chrome.storage.sync.get("settings", function(data){
		this.settings = data.settings;
		if(this.settings != null){
			blockedSites.value = this.settings;
		}
	});
}

getSettings();

document.getElementById("save").onclick = function() {
	chrome.storage.sync.set({"settings": blockedSites.value});
};

document.getElementById("cancel").onclick = function() {
	getSettings();
};
