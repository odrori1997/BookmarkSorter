'use strict';

// initialize variables

var url;
let tagInput = [];
// get url of current selected tag
chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
		url = tabs[0].url;
		console.log(url);
});

function openPage(e) {
	var absolutePath = chrome.runtime.getURL("bookmarkspage.html");
	var BookmarksPage = window.open(absolutePath);
}



document.addEventListener('DOMContentLoaded', function() {
	var inputs = document.querySelectorAll('input');
		for (var i = 0; i < inputs.length; i++) {
			if (inputs[i].id == 'tag') {
				tagInput = inputs[i];
				// console.log(rawTags);
			}

			else if (inputs[i].id == 'submitButton') {
				inputs[i].addEventListener("click", addMark);
			}

		}
});

function addMark(e) {

	// open 'add bookmark' popup
	// tags are comma-separated

	// var absolutePath = chrome.runtime.getURL("addURLpage.html");

	let rawTags = tagInput.value;
	// console.log(rawTags);
	// console.log(tagInput);

	let title = document.getElementById("title").value;
	let tags = [];
	let startInd = 0;
	for (let i = 0; i < rawTags.length; i++) {
		if (rawTags[i] == ',') {
			tags.push(rawTags.slice(startInd, i).trim());

		}
	}

	if (rawTags)
		tags.push(rawTags.slice(startInd).trim());


	// console.log(tags);
	// console.log(rawTags.toString());


	var newMark = {
		parentId: null,
		index: null,
		title: title,
		url: url,
	}



	chrome.bookmarks.create(newMark);

	chrome.bookmarks.getRecent(1, function(bookmarkTreeNode) {
		let bookmark = bookmarkTreeNode[0];
		// console.log(bookmark);

		// chrome.storage.sync.clear(function() {
		// 	console.log("Storage cleared.");
		// });

		// in testing
		var url = JSON.stringify({'url' : [ {'url1': bookmark.url} ]});
		// in testing

		// original:
		// var url = JSON.stringify({'url': bookmark.url});
		var json = {};
		// console.log(json.url);

		for (let tag of tags) {

			json[tag] = url;


			// in testing
			chrome.storage.sync.get( tag, function(item) {
				if (chrome.runtime.lastError) {
					chrome.storage.sync.set( json , function() {
					// alert(tag + " " + json.url + " saved.");
					console.log("saved.", tag, url);
			
					});
				}
				else {
					let obj = JSON.parse(item[tag]);
					obj.url.push(obj.url.length, bookmark.url);

					chrome.storage.sync.set(, function() {
						console.log("saved.", tag, url);
					})
				}
			});
			// in testing

			// original:
			// chrome.storage.sync.set( json , function() {
			// // alert(tag + " " + json.url + " saved.");
			// 	console.log("saved.", tag, url);
			
			// });
		}
	});
	
	// window.close();


}

document.addEventListener('DOMContentLoaded', function() {
	var buttons = document.querySelectorAll('button');
		for (var i = 0; i < buttons.length; i++) {

			if (buttons[i].id == 'add') {
				buttons[i].addEventListener('click', addMark);
			}
			else {
				buttons[i].addEventListener('click', openPage);
			}
		}
});

