let tagInput = [];


document.addEventListener('DOMContentLoaded', function() {
	

	let inputs = document.querySelectorAll('input');
	for (let input of inputs) {
		if (input.id == "searchTags") {
			input.addEventListener("click", searchTags);
		}
		else if (input.id == "newFolder") {

		}

		else if (input.id == "delete") {

		}
		else if (input.id == "tagsToSearch") {
			tagInput = input;
		}

	}


});

function elt(type, attr, ...children) {
	let node = document.createElement(type);

	for (let child of children) {
		if (typeof child != "string") {
			node.appendChild(child);
		}
		else {
			node.appendChild(document.createTextNode(child));
		}
	}

	node.setAttribute(attr);
}



let BookMarkTree = chrome.bookmarks.getTree(function (bookmarkTree) {
	chrome.bookmarks.getChildren(bookmarkTree[0].id, loadBookmarks);
});

function loadBookmarks(bookmarkTreeNodes) {
	let ul = document.createElement("ul");
	document.body.appendChild(ul);
	for (let i = 0; i < bookmarkTreeNodes.length; i++) {
		console.log(bookmarkTreeNodes[i]);
		let bookmarkListItem = document.createElement("li");
		let data = document.createTextNode(bookmarkTreeNodes[i].title);
		bookmarkListItem.appendChild(data);
		ul.appendChild(bookmarkListItem);

		bookmarkListItem.addEventListener("click", function(event) {
			if (bookmarkTreeNodes[i].url)
				window.open(bookmarkTreeNodes[i].url);

			chrome.bookmarks.getChildren(bookmarkTreeNodes[i].id, loadBookmarks) == null;
				
		});
	}
}

function searchTags(e) {
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

	for (let i = 0; i < tags.length; i++) {
		chrome.storage.sync.get(tags[i], function(bookmarks){


			if (chrome.runtime.lastError)
				console.log(chrome.runtime.lastError.message);

			let obj = JSON.parse(bookmarks[tags[i]]);

			if (bookmarks)
				chrome.bookmarks.search(obj.url, function(results) {
					if (chrome.runtime.lastError)
						console.log(chrome.runtime.lastError.message);
					else
						loadBookmarks(results);
				});

		});
	}
}
