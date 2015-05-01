var rootURL = "https://slack.com/api/";
var tokenPath = NSHomeDirectory() + "/.slackToken"

function requestAndSaveToken() {
	var token = [doc askForUserInput:"What is your API token? (https://api.slack.com/web)" initialValue:""]
	if (verifyAuth(token) == true) {
		var fileManager = NSFileManager.defaultManager()
		fileManager.createFileAtPath_contents_attributes(tokenPath, token, nil)
	} else {
		[doc showMessage:"Your Slack API token is invalid!"]
	}
}

function verifyAuth(token) {
	var response = getJSON(rootURL + "auth.test?token=" + token);
	if (response.ok == true) {
		[doc showMessage: "Logged in as " + response.user];
	}
	return response.ok;
}

function getActiveToken() {
	var fileExists = NSFileManager.defaultManager().fileExistsAtPath(tokenPath);
	if (fileExists) {
		var token = NSString.stringWithContentsOfFile_encoding_error(tokenPath,NSUTF8StringEncoding,nil)
		return token
	} else {
		return false;
	}
}

function getUserNames() {
	var token = getActiveToken();
	var response = getJSON(rootURL + "users.list?token=" + token);
	var userNames = [];
	for (var i = 0; i < response.members.count(); i++) {
		var user = response.members[i]
		userNames.push(user.name + " (" + user.real_name + ")")
	}
	return userNames;
}

function getUserIDs() {
	var token = getActiveToken();
	var response = getJSON(rootURL + "users.list?token=" + token);
	var userIDs = [];
	for (var i = 0; i < response.members.count(); i++) {
		var user = response.members[i]
		userIDs.push(user.id)
	}
	return userIDs;
}

function openIMAndSend(userID) {
	var token = getActiveToken();
	var response = getJSON(rootURL + "im.open?token=" + token + "&user=" + userID);
	exportArtboardsAndSendTo(response.channel.id)
}

function getChannelNames() {
	var token = getActiveToken();
	var response = getJSON(rootURL + "channels.list?token=" + token + "&exclude_archived=1");
	var activeMemberships = [];
	for (var i = 0; i < response.channels.count(); i++) {
		if (response.channels[i].is_member == true) {
			var channel = response.channels[i]
			activeMemberships.push("#" + channel.name)
		}
	}
	return activeMemberships;
}

function getChannelIDs() {
	var token = getActiveToken();
	var response = getJSON(rootURL + "channels.list?token=" + token + "&exclude_archived=1");
	var activeMemberships = [];
	for (var i = 0; i < response.channels.count(); i++) {
		if (response.channels[i].is_member == true) {
			var channel = response.channels[i]
			activeMemberships.push(channel.id)
		}
	}
	return activeMemberships;
}

function getGroupNames() {
	var token = getActiveToken();
	var response = getJSON(rootURL + "groups.list?token=" + token + "&exclude_archived=1");
	var groups = [];
	for (var i = 0; i < response.groups.count(); i++) {
		var group = response.groups[i];
		groups.push(group.name);
	}
	return groups;
}

function getGroupIDs() {
	var token = getActiveToken();
	var response = getJSON(rootURL + "groups.list?token=" + token + "&exclude_archived=1");
	var groups = [];
	for (var i = 0; i < response.groups.count(); i++) {
		var group = response.groups[i];
		groups.push(group.id);
	}
	return groups;
}


function exportArtboardsAndSendTo(recipient) {
	var loop = [selection objectEnumerator]
	while (item = [loop nextObject]) {
		if (item.className() == "MSArtboardGroup") {
			var path = NSTemporaryDirectory() + item.name() + ".png"
			[doc saveArtboardOrSlice:item toFile: path];
			postFile(path, recipient)
		}
	}
}

function postFile(path, recipient) {
	var task = NSTask.alloc().init()
	task.setLaunchPath("/usr/bin/curl");
	var args = NSArray.arrayWithObjects("-F", "token=" + getActiveToken(), "-F", "file=@" + path, "-F", "channels=" + recipient, "https://slack.com/api/files.upload", nil);
	task.setArguments(args);
    task.launch();
}
