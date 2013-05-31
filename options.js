var delay = 1500; // 1.5 seconds
var lastVal = '';
var timer;

init();

function init() {
	var username = document.getElementById("username");
	var password = document.getElementById("password");
	username.value = localStorage.getItem("username");
	password.value = localStorage.getItem("password");
	//console.log("u:"+username.value+"   v:"+password.value);
	if (username.value != '' || password.value != '') {
		checkPassword(password);
	}
	
	var search = window.location.search;
	console.log(search);
	if (search == "?new") {
		// new install
	} else if (search == "?updated") {
		// updated version
	} else if (search == "?invalidcredentials") {
		var $alert = $("#alert");
		$alert.html("Your credentials aren't correct. Please update them");
		$alert.css("display","inline-block");
	}

    $("#username").blur(function() {
        checkUsername();
    });
    $("#password").keyup(function(e) {
        console.log(e);
        checkPassword(e);
    });
}

function checkUsername() {
	var username = document.getElementById("username").value;
	var base64 = window.btoa(username+": ");
	$.ajax({
		url: "https://www.instapaper.com/api/authenticate",
		type: "POST",
		beforeSend: function (xhr) {
			xhr.setRequestHeader("Authorization", "Basic " + base64);
		},
		statusCode: {
			200: function(data) {
				var $res = $("#credentialResults");
				$res.html("Username valid without password");
				$res.css("display","inline-block");
				localStorage.username = username;
				localStorage.base64 = base64;
				$("#alert").css("display","none");
			}
		}
	});
}

function checkPassword(input) {
	val = $("#password").val();
	if (val != lastVal) {
		if (timer)
			clearTimeout(timer);
		
		var username = $("#username").val();
		var password = val;
		var base64 = window.btoa(username+":"+password);
		timer = setTimeout(function() {
			$.ajax({
				url: "https://www.instapaper.com/api/authenticate",
				type: "POST",
				beforeSend: function (xhr) {
					xhr.setRequestHeader("Authorization", "Basic " + base64);
				},
				statusCode: {
					200: function(data) {
						var $res = $("#credentialResults");
						$res.html("Username and password valid");
						$res.css("display","inline-block");
						localStorage.username = username;
						localStorage.password = password;
						localStorage.base64 = base64;
						$("#alert").css("display","none");
					},
					403: function() {
						//credentials invalid
					}
				}
			});
		}, delay);
		lastVal = val;
	}
}

