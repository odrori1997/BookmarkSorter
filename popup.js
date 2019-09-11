// author: Omer Drori



'use strict';

var url;
let tagInput = [];

// get url of current selected tab
chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
		url = tabs[0].url;
});

// open bookmarks page
function openPage(e) {
	var absolutePath = chrome.runtime.getURL("bookmarkspage.html");
	var BookmarksPage = window.open(absolutePath);
}


// add event listeners 
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


/*
	- adds current tab url to chrome bookmarks
	- adds two objects to storage (in JSON format):
		-a tag: url pair
		-a url: tag pair
*/

function addMark() {

	// tags are comma-separated


	let rawTags = tagInput.value;
	// console.log(rawTags);
	// console.log(tagInput);

	let title = document.getElementById("title").value;
	let tags = [];

	// separate tags by comma
	let startInd = 0;
	for (let i = 0; i < rawTags.length; i++) {
		if (rawTags[i] == ',') {
			tags.push(rawTags.slice(startInd, i).trim());
			startInd = i + 1;
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


		// To clear storage on chrome: 
		// chrome.storage.sync.clear(function() {
		// 	console.log("Storage cleared.");
		// });


		var jsonURL = {};
		var jsontagURL = JSON.stringify({'tag': [ { tag: tags[0] } ] });
		jsonURL[bookmark.url] = jsontagURL;
		let jsonobjURL = JSON.parse(jsonURL[bookmark.url]);

		chrome.storage.sync.set( jsonURL );

		var json = {};
		// console.log(json.url);


		for (let i = 0; i < tags.length; i++) {

			// first, store url : tag pair
			// console.log(jsonobjURL.tag[0].tag);
			// console.log(jsonobjURL.tag.filter(t => t.tag != tags[i]));
			if (jsonobjURL.tag.filter(t => t.tag === tags[i]).length === 0) {
				jsonobjURL.tag.push({ tag: tags[i] });
				jsonURL[bookmark.url] = JSON.stringify(jsonobjURL);

				// console.log(jsonURL[bookmark.url]);
				chrome.storage.sync.set( jsonURL, function() {

				});

			}

			// for error checking:
			// chrome.storage.sync.get(bookmark.url, function(result) {
			// 	console.log((result));
			// });

			// now, store tag: url pair

			let ind = i.toString();
			
			var url = JSON.stringify({'url' : [ { key : bookmark.url } ]});
			json[tags[i]] = url;


			
			chrome.storage.sync.get( tags[i], function(item) {
				if (chrome.runtime.lastError) {
					chrome.storage.sync.set( json , function() {
					// alert(tag + " " + json.url + " saved.");
					// console.log("saved.", tags[i], url);
			
					});
				}
				else if (item[tags[i]]) {
					// console.log(item[tags[i]]);
					let obj = JSON.parse(item[tags[i]]);
					// console.log(obj);

					obj.url.push({key : bookmark.url});
					// console.log(newKey + " : " + bookmark.url + " pushed.");
					json[tags[i]] = JSON.stringify(obj);
					chrome.storage.sync.set( json, function() {
						// console.log("saved.", tags[i], url);
					});
					// chrome.storage.sync.get(tags[i], function(result) {
					// 		console.log(result);
					// });
				}
				else {
					chrome.storage.sync.set( json , function() {
					// alert(tag + " " + json.url + " saved.");
					// console.log("saved.", tags[i], url);
			
					});
				}
			});

		}
	});
	
	// window.close();


}
