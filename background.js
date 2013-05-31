function compareVersion(oldv,newv) {
	// return 0 if they're the same version, -1 if oldv is higher, 1 if newv is higher
    var olda = oldv.split(".");
    var newa = newv.split(".");
    for (var i=0;i<olda.length;i++) {
        if (olda[i] == newa[i])
            continue;
        else if (olda[i] < newa[i])
            return 1;
        else
            return -1;
    }
    if (olda.length < newa.length)
        return 1;
    return 0;
}
function checkVersion() {
	$.get("manifest.json", function(data) {
		var version = data.version;
		var lsVersion = localStorage.getItem("version");
		//console.log("ls:"+lsVersion+"  v:"+version);
		localStorage.version = version;
		if (lsVersion == null) {
			lsVersion = "0";
			chrome.tabs.create({url:"options.html?new"});
		} else {
			if (compareVersion(lsVersion,version) > 0) {
				// here means updated version
				//chrome.tabs.create({url:"options.html?updated"});
			}
		}
	}, "json");
}
checkVersion();
var lastTime = new Date().getTime();
var twice = false;
var delayTime = 500;
function add(loc,title,tabid) {
	if (localStorage.getItem("base64") == null) {
		chrome.tabs.create({url:"options.html?invalidcredentials"});
		return;
	}
	
	//console.log("l:"+loc+"   t:"+title);
	if (loc.indexOf("http://www.google.com/reader/") == 0 || loc.indexOf("https://www.google.com/reader/") == 0) {
		chrome.tabs.executeScript(tabid,{file:"reader.js"});
		return;
	}

	if (loc.indexOf("http://www.feedly.com/") == 0) {
		chrome.tabs.executeScript(tabid,{file:"feedly.js"});
		return;
	}
	
	$.ajax({
		url: "https://www.instapaper.com/api/add",
		type: "POST",
		beforeSend: function (xhr) {
			xhr.setRequestHeader("Authorization", "Basic " + localStorage.base64);
            chrome.browserAction.setBadgeBackgroundColor({color:"#FFD300"});
            chrome.browserAction.setBadgeText({text:"send"});
		},
		data: {
			url: loc,
			title: title
		},
		statusCode: {
			201: function(data) {
				console.log("added "+loc);
                chrome.browserAction.setBadgeBackgroundColor({color:"#00CC00"});
				chrome.browserAction.setBadgeText({text:"done"});
				setTimeout(function() {
					chrome.browserAction.setBadgeText({text:""});
				},1000);
			},
			403: function() {
				chrome.tabs.create({url:"options.html?invalidcredentials"});
                chrome.browserAction.setBadgeBackgroundColor({color:"#FD0006"});
				chrome.browserAction.setBadgeText({text:"err"});
				setTimeout(function() {
					chrome.browserAction.setBadgeText({text:""});
				},5000);
			}
		}
	});
}

chrome.browserAction.onClicked.addListener(function(tab) {
    var currentTime = new Date().getTime();
    if (currentTime - lastTime > delayTime) {
        twice = false;
        setTimeout(function() {
            if (twice)
				return;
            add(tab.url,tab.title,tab.id);
        }, 500);
    } else {
        twice = true;
        chrome.tabs.create({url:"http://www.instapaper.com/u"});
    }
    lastTime = currentTime;
});

chrome.extension.onRequest.addListener(function(req, sender, response) {
	if (req.action == "add") {
		add(req.loc,req.title);
	} else if (req.action == "errorreader") {
		console.log("error from reader.js");
	} else if (req.action == "errorfeedly") {
		console.log("error from feedly.js");
	}
});

function addFromMenu(clickData) {
    pagetitle = '';
    if (clickData.hasOwnProperty('linkUrl')) {
		toAdd = clickData.linkUrl;
		add(toAdd);

    } else {
		var title;
		chrome.tabs.query({active:true},function(tab) {
			title = tab[0].title;
			add(clickData.pageUrl,title);
		});
    }
}
chrome.contextMenus.create({
	"title": "Send to Instapaper",
	"contexts": ["page","link"],
	"onclick": addFromMenu
});
