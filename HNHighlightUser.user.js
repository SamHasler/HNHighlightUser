// ==UserScript==
// @name           HNHighlightUser
// @description    This script adds identicons next to posts on HN, so you can easily follow authors.
// @include        http://news.ycombinator.com/*
// @include        https://news.ycombinator.com/*
// @require        https://ajax.googleapis.com/ajax/libs/jquery/1.7.0/jquery.min.js
// @require        https://raw.github.com/SamHasler/identicon/master/identicon.js
// ==/UserScript==

var IDENTICON_SIZE = 16;

//From http://stackoverflow.com/a/8076436/2541
function hashCode(string){
    var hash = 0;
    if (string.length == 0) return hash;
    for (i = 0; i < string.length; i++) {
        char = string.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}
    
var identiconsCache = {};

function getDataUrlForAuthor(author){
    if (identiconsCache[author] != null){
        return identiconsCache[author];
    }
    new Identicon('identiconCanvas', hashCode(author), IDENTICON_SIZE);
    var canvas = document.getElementById('identiconCanvas');
    var dataURL = canvas.toDataURL("image/png");
    identiconsCache[author] = dataURL;
    return dataURL;
}

//the style that is applied to highlighted posts.
var classes = "<style>"
        +".highlight {background-color:#FFB380;}"
    +"span.identicon {position: relative;width: 20px;margin-right: 20px;}"
    +".identicon img {position: absolute;opacity: 0.5}"
    +"</style>";

if (window.location.pathname === "/item") {

    $("body").prepend(classes + '<canvas id="identiconCanvas" style="display:none;" width="'+ IDENTICON_SIZE +'" height="'+ IDENTICON_SIZE +'"></canvas>');
	
    $("span.comhead").each(function() {
        var commentDetails = $(this).text().match(/([A-Za-z0-9_]+) ([0-9]{0,3} (?:minutes?|hours?|days?|years?) ago)/);
        
        //The comhead acts slightly differently depending on whether its "Ask HN" type post or a link
        //Links do not have comhead details so we have to check for null
        if(commentDetails !== null) {
            var commentAuthor = commentDetails[1];
            
			//very simple setup here.  Each highlight link's id is the author
            $(this).prepend("<span class='identicon'><img class='highlightLink' id='" + commentAuthor + "' src='" + getDataUrlForAuthor(commentAuthor) + "'></span>");

			//and each comment table row gets a class name that corresponds to the author
			$(this).parents().eq(1).addClass(commentAuthor);
			
        }
    });
    
	//when we want to highlight an author, just find all the classes that match the author name and toggle the class
	$(".highlightLink").click(function(e){
		$("." + this.id).toggleClass("highlight");
		e.preventDefault();
	});
}
