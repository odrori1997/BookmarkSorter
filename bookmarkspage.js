let tagInput = [];

document.addEventListener('DOMContentLoaded', function() {

	let inputs = document.querySelectorAll('input');
	for (let input of inputs) {
		if (input.id == "searchTags") {
			input.addEventListener("click", searchTags);
		}
		else if (input.id == "tagsToSearch") {
			tagInput = input;
			input.addEventListener("keyup", function(e) {
				if (e.key == "Enter")
					searchTags(e);
			});
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
	let ul = document.getElementById("list");

	for (let i = 0; i < bookmarkTreeNodes.length; i++) {
		console.log(bookmarkTreeNodes[i]);
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
		}

		var spanClose = document.createElement("span");
		var txtClose = document.createTextNode("\u00D7");
		spanClose.className = "close";
		spanClose.appendChild(txtClose);
		bookmarkListItem.appendChild(spanClose);

		

		

		// add Event listeners

		bookmarkListItem.addEventListener("click", function(event) {
			chrome.bookmarks.getChildren(bookmarkTreeNodes[i].id, loadBookmarks) == null;
				
		});

		spanClose.onclick = function() {
			let div = this.parentElement;
			div.style.display = "none";
			// remove bookmark from chrome too

			chrome.bookmarks.remove(bookmarkTreeNodes[i].id);
		}
		if (spanOpen) {
			spanOpen.onclick = function() {
				if (bookmarkTreeNodes[i].url)
					window.open(bookmarkTreeNodes[i].url);
			}
		}
		
	}

}

function deleteBookmark() {

	
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
			console.log(obj);

			if (bookmarks) {
				for (let j = 0; j < obj.url.length; j++) {
					chrome.bookmarks.search(obj.url[j].key, function(results) {
						if (chrome.runtime.lastError)
							console.log(chrome.runtime.lastError.message);
						else
							loadBookmarks(results);
					});
			}
		}
		});
	}
}


