'use strict';

let newMark;
chrome.bookmarks.getRecent(1, function (results) {
	newMark = results[0];
	console.log(newMark.title);
});
var changes = {
	title: ""
}
var tags;

var taggedMark = {
	bookmark: newMark,
	tags: ""
}

function dropDown() {
	document.getElementById("dropdown").classList.toggle("show");
}

window.onclick = function(event) {
	if (!event.target.matches('.dropbtn')) {
		var dropdowns = document.getElementsByClassName("dropdown-content");
		var i;
		for (i = 0; i < dropdowns.length; i++) {
			var openDropdown = dropdowns[i];
			if (openDropdown.classList.contains('show')) {
				openDropdown.classList.remove('show');
			}
		}
	}
}

function loadDropElements() {
	var menu = document.getElementById("dropdown");
	var elements;
	chrome.bookmarks.getTree(function(results){
		elements = results;
	});
	var i;
	for (i = 0; i < elements.length; i++) {
		var newEntry = document.createElement("a");
		newEntry.title = elements[i].title;
		newEntry.href = "#" + elements[i].title;
		menu.appendChild(newEntry);
	}
}

// add url link to object

document.addEventListener('DOMContentLoaded', function() {
	var inputs = document.querySelectorAll('input');
		for (var i = 0; i < inputs.length; i++) {
			if (inputs[i].id == 'title') {
				changes.title = inputs[i].value;
			}
			else if (inputs[i].id == 'tags') {
				tags = inputs[i].tags;
			}

			else if (inputs[i].id == 'submitButton') {
				inputs[i].addEventListener("click", addMark);
			}

		}
});


function addMark() {

	chrome.bookmarks.update(newMark.id, changes);
	let rawTags = document.getElementById("tag");
	console.log(rawTags.value);
	let tags = [];
	let start = 0;
	for (let i = 0; i < rawTags.value.length; i++) {
		if (rawTags.value[i] == ",") {
			tags.shift(rawTags.slice(start, i));
		}
	}

	taggedMark.tags = tags;

}