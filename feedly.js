// feedly.js -- get currently read article, send back to background.html
//   if no article currently being read, send error back

var item = document.getElementsByClassName("u100Entry")[0];
if (item) {
	var loc = item.getAttribute("data-alternate-link");
	var title = item.getAttribute("data-title")
	console.log(loc);
	console.log(title);
	chrome.extension.sendRequest({"action":"add","loc":loc,"title":title});
} else
	chrome.extension.sendRequest({"action":"errorfeedly"});
