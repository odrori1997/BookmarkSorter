let tagInput = [];
var loadedMarks = [];

let home = document.createElement("span");
let txtHome = document.createTextNode("\u2302");
home.appendChild(txtHome);
home.className = "home";


document.addEventListener('DOMContentLoaded', function() {

	let header = document.getElementById("header");
	header.appendChild(home);
	home.addEventListener("click", function() {
		let ul = document.getElementById("list");
		ul.parentNode.removeChild(ul);

		let newUL = document.createElement("ul");
		newUL.id = "list";
		document.body.appendChild(newUL);
		loadHome();
		loadedMarks = [];
	});

	let inputs = document.querySelectorAll('input');
	for (let input of inputs) {
		if (input.id == "searchTags") {
			input.addEventListener("click", searchTags);
		}
		else if (input.id == "tagsToSearch") {
			tagInput = input;
			input.addEventListener("keyup", function(e) {
				if (e.key == "Enter") {
				// 	let promise = new Promise(function(resolve, reject) {
						
				// 		let results = searchTags();
				// 		if (results.length > 0)
				// 			resolve(results);
				// 		// else
				// 		// 	reject(console.log("No results returned"));


				// 	});

				// 	promise.then(function(results) {
				// 		loadBookmarks(results);
				// 	}, function(err) {
				// 		console.log(err);
				// 	});

					searchTags();
				}
			});
		}
	}
});





function loadHome() {
	chrome.bookmarks.getTree(function (bookmarkTree) {
		chrome.bookmarks.getChildren(bookmarkTree[0].id, function (results) {
			if (chrome.runtime.lastError)
				console.log(chrome.runtime.lastError.message);
			loadBookmarks(results);
		});
	});
}

loadHome();

function loadBookmarks(bookmarkTreeNodes) {
	let ul = document.getElementById("list");

	if (bookmarkTreeNodes) {


		// console.log(bookmarkTreeNodes);
		// console.log(bookmarkTreeNodes.length);
		// console.log(bookmarkTreeNodes[0]);
		for (let i = 0; i < bookmarkTreeNodes.length; i++) {
			// console.log(bookmarkTreeNodes[i]);
			// console.log(loadedMarks);


			// avoid duplicate bookmarks
			if (bookmarkTreeNodes[i].url) {
				if (loadedMarks.includes(bookmarkTreeNodes[i].url)) {
					continue;
				}
				loadedMarks.push(bookmarkTreeNodes[i].url);
			}
			
			let bookmarkListItem = document.createElement("li");
			let data = document.createTextNode(bookmarkTreeNodes[i].title);
			bookmarkListItem.appendChild(data);
			ul.appendChild(bookmarkListItem);

			// Create a "close", "open", and "edit tags" button for each list item
			if (!bookmarkTreeNodes[i].url) {
				var spanFolder = document.createElement("span");
				var txtFolder = document.createTextNode("\uD83D\uDDC0");
				spanFolder.className = "folder";
				spanFolder.appendChild(txtFolder);
				bookmarkListItem.appendChild(spanFolder);
			}

			else {
				var spanOpen = document.createElement("open");
				var txtOpen = document.createTextNode("\uD83D\uDD17");
				spanOpen.className = "open";
				spanOpen.appendChild(txtOpen);
				bookmarkListItem.appendChild(spanOpen);

				var spanEdit = document.createElement("span");
				var txtEdit = document.createTextNode("\u270E");
				spanEdit.className = "edit";
				spanEdit.appendChild(txtEdit);
				bookmarkListItem.appendChild(spanEdit);
			}

			

			var spanClose = document.createElement("span");
			var txtClose = document.createTextNode("\u00D7");
			spanClose.className = "close";
			spanClose.appendChild(txtClose);
			bookmarkListItem.appendChild(spanClose);

			

			

			// add Event listeners
			// console.log(bookmarkTreeNodes[i]);
			bookmarkListItem.addEventListener("click", function(event) {
				chrome.bookmarks.getChildren(bookmarkTreeNodes[i].id, function(results) {
					if (chrome.runtime.lastError)
						console.log(chrome.runtime.lastError.message);
					loadBookmarks(results);
				});
					
			});

			spanClose.onclick = function() {
				let div = this.parentElement;
				div.style.display = "none";

				for (let mark in loadedMarks) {
					if (bookmarkTreeNodes[i].url === mark)
						delete mark;
				}

				let promise = new Promise((resolve) =>
					{
						editTags(bookmarkTreeNodes[i], true); 
						resolve(true);
					});
				promise.then(chrome.bookmarks.remove(bookmarkTreeNodes[i].id)).catch(function() {console.log("Error");});




			}

			if (spanEdit) {
				spanEdit.addEventListener("click", function() {editTags(bookmarkTreeNodes[i], false);});
			}

			if (spanOpen) {
				spanOpen.onclick = function() {
					if (bookmarkTreeNodes[i].url)
						window.open(bookmarkTreeNodes[i].url);
				}
			}

		}

	}

}

function editTags(bookmark, remove) {

		chrome.storage.sync.get(bookmark.url, function(results) {
			if (chrome.runtime.lastError)
				console.log(chrome.runtime.lastError.message)

			if (bookmark) {

				var tagString = [];

				if (results[bookmark.url]) {
					let obj = JSON.parse(results[bookmark.url]);

					tagString = obj.tag[0].tag;
					let i = 1;
					while (i < obj.tag.length) {
						tagString = tagString + ", " + obj.tag[i].tag;
						i++;
					}
				}
				// if bookmark exists, but no results in storage, then this is a prevoius bookmark from chrome. load an empty tags dialogue for 
				// this bookmark.

				else {
					tagString = "";
				}
					if (!remove)
						var newTags = prompt(bookmark.title + " has the following tags: ", tagString);
					else
						newTags = "";
					// console.log(newTags);
					// if user hits cancel, just return
					if (newTags == null) {
						return;
					}

					// store new tag: url and url: tag pairs

					let tags = [];
					let startInd = 0;
					for (let i = 0; i < newTags.length; i++) {
						if (newTags[i] == ',') {
							tags.push(newTags.slice(startInd, i).trim());
							startInd = i+1;
						}
					}

					if (newTags)
						tags.push(newTags.slice(startInd).trim());

					var jsonURL = {};
					
					var jsontagURL = JSON.stringify({'tag': [ { tag: tags[0] } ] });
					jsonURL[bookmark.url] = jsontagURL;
					let jsonobjURL = JSON.parse(jsonURL[bookmark.url]);

					chrome.storage.sync.set( jsonURL );

					var json = {};

					for (let i = 0; i < tags.length; i++) {

						// first, store url : tag pair
						// console.log(jsonobjURL.tag[0].tag);
						// console.log(jsonobjURL.tag.filter(t => t.tag != tags[i]));
						// jsonobjURL.tag.map(t => console.log(t.tag));
						if (jsonobjURL.tag.filter(t => t.tag === tags[i]).length === 0) {
							jsonobjURL.tag.push({ tag: tags[i] });
							jsonURL[bookmark.url] = JSON.stringify(jsonobjURL);

							// console.log(jsonURL[bookmark.url]);
							chrome.storage.sync.set( jsonURL, function() {

							});

						}

						// chrome.storage.sync.get(bookmark.url, function(result) {
						// 	console.log((result));
						// });
						// now, store tag: url pair

						let ind = i.toString();
						
						var url = JSON.stringify({'url' : [ { key : bookmark.url } ]});
						json[tags[i]] = url;


						// in testing
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
									
		}
	});
}

function searchTags() {
	let tags = [];
	let startInd = 0;

	let raw = tagInput.value;


	if (raw) {
		for (let i = 0; i < raw.length; i++) {
			if (raw[i] == ',') {
				tags.push(raw.slice(startInd, i).trim());
			}
		}

		tags.push(raw.slice(startInd).trim());
	}

	// var searchResults = [];

	for (let i = 0; i < tags.length; i++) {
		chrome.storage.sync.get(tags[i], function(bookmarks){


			if (chrome.runtime.lastError)
				console.log(chrome.runtime.lastError.message);

			

			if (bookmarks) {

				let obj = JSON.parse(bookmarks[tags[i]]);
				// console.log(obj);

				for (let j = 0; j < obj.url.length; j++) {
					chrome.bookmarks.search(obj.url[j].key, function(results) {
						if (chrome.runtime.lastError)
							console.log(chrome.runtime.lastError.message);
						else {
							loadBookmarks(results);
							// searchResults.push(...results.filter(r => !existsIn(r, searchResults)));
							// if (searchResults.filter(r => existsIn(r, results)))
							// 	results.map(r => searchResults.push(r));
							// console.log(...results.filter(r => existsIn(r, searchResults)));
						}
					});
				}
			}

			chrome.bookmarks.search(tags[i], function(results) {
				if (chrome.runtime.lastError)
					console.log(chrome.runtime.lastError.message);
				else {
					loadBookmarks(results);
					// searchResults.push(...results.filter(r => !existsIn(r, searchResults)));
					// if (searchResults.filter(r => existsIn(r, results)))
					// 	results.map(r => searchResults.push(r));	
					// console.log(...results.filter(r => existsIn(r, searchResults)));
				}
			});
		});


	}


	// return searchResults;

}

// find if t already in bookmarkArr
function existsIn(t, bookmarkArr) {
	for (let i = 0; i < bookmarkArr.length; i++)
		if (t.id === bookmarkArr[i].id || t.title === bookmarkArr[i].title || t.url === bookmarkArr[i].url)
			return true;

	return false;
}