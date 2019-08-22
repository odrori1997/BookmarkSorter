'use strict';


function openPage(e) {
	var absolutePath = chrome.runtime.getURL("bookmarkspage.html");
	var BookmarksPage = window.open(absolutePath);
}

function addMark(e) {
	// add bookmark to json file

	// open 'add bookmark' popup
	// tags are comma-separated

	var absolutePath = chrome.runtime.getURL("addURLpage.html");
	var currentURL = document.URL;
	var URLPage = window.open(absolutePath); 
	


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

