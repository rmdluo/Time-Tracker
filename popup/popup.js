var background = chrome.extension.getBackgroundPage();

if(background.active){
	document.getElementById("activate").checked = true;
}

function activate(){
	chrome.runtime.sendMessage({data:"activate"});
}

document.getElementById("activate").onclick = activate;

function formatTime(seconds){
	var time = "";
	var hours = Math.floor(seconds / 3600);
	if(hours == 0){
		time = "00:"
	} else {
		time = hours + ":";
	}

	seconds = seconds - hours * 3600;

	var minutes = Math.floor(seconds / 60);
	if(minutes == 0){
		time = time + "00" + ":";
	} else if(minutes < 10){
		time = time + "0" + minutes + ":";
	} else {
		time = time + minutes + ":";
	}
	seconds = Math.round((seconds - minutes * 60) * 1000) / 1000;
	if(seconds < 10){
		time = time + "0";
	}
	time = time + seconds;
	return time;
}

document.getElementById("seeInfo").onclick = function () {
	var urlArray = background.urls;
	var timeArray = background.times;
	var date = new Date();

	var text = "";

	var i;
	for (i = 0; i < urlArray.length; i++){
		if(urlArray[i] !== ""){
			if(urlArray[i] == background.currentUrl){
				timeArray[i] = timeArray[i] + (Date.now() - background.startTime) / 1000;
			}
			text += urlArray[i] + ": " + formatTime(timeArray[i]) + "<br>";
		}
	}

	background.currentUrl = "";
	background.pastUrl = "";
	startTime = Date.now();

	newWindow = window.open("", "Compiler", "" );
	doc = newWindow.document;
	doc.open("text/html","replace");
	doc.writeln('<!DOCTYPE html');
	doc.writeln("<html>");
	doc.writeln("<head>");
	doc.writeln("<title>Stats</title>");
	doc.writeln("</head>");
	doc.writeln("<body>");
	doc.writeln(text);
	doc.writeln("</body>");
	doc.writeln("</html>");
	doc.close();
};

const hourHand = document.querySelector("#hour-hand");
const minuteHand = document.querySelector("#minute-hand");
const secondHand = document.querySelector("#second-hand");

setInterval(setClock, 1000);

function setClock(){
	const currentDate = new Date();
	const secondsRatio = currentDate.getSeconds() / 60;
	const minutesRatio = (currentDate.getMinutes() + secondsRatio) / 60;
	const hoursRatio = (currentDate.getHours() + minutesRatio) / 12;

	setRotation(secondHand, secondsRatio);
	setRotation(minuteHand, minutesRatio);
	setRotation(hourHand, hoursRatio);
}

function setRotation(element, rotationRatio) {
	element.style.setProperty("--rotation", rotationRatio * 360);
}

setClock();

function setDigitalClock() {
	const currentDate = new Date();
	let timeString = " AM";
	let hour = currentDate.getHours();
	let minute = currentDate.getMinutes();

	if(minute < 10) {
		timeString = ":0" + String(minute) + timeString;
	} else {
		timeString = ":" + String(minute) + timeString;
	}

	if(hour > 12) {
		timeString = String(hour - 12) + timeString.substring(0, 3) + " PM";
	} else {
		timeString = String(hour) + timeString;
	}

	document.getElementById("time").innerHTML=timeString;
}

setInterval(setDigitalClock, 1000);

setDigitalClock();

document.getElementById("options").onclick = function() {
	window.open("/options/options-blocked-sites.html");
}
