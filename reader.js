// googlereader.js -- get currently read article, send back to background.html
//   if no article exists send error back

var item = document.getElementsByClassName("entry-title-link")[0];
if (item) {
	var loc = item.href;
	var title = item.innerText;
	//console.log("l:"+loc+"   t:"+title);
	chrome.extension.sendRequest({"action":"add","loc":loc,"title":title});
} else
	chrome.extension.sendRequest({"action":"errorreader"});
