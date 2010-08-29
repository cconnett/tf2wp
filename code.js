var point = 3;
var stateKeys = [
    ["b1", '#blueclasses .scout', 2],
    ["b2", '#blueclasses .soldier', 2],
    ["b4", '#blueclasses .demoman', 1],
    ["b7", '#blueclasses .medic', 1],
    ["bc", '#blueclasses .charge', 1],
    ["r1", '#redclasses .scout', 2],
    ["r2", '#redclasses .soldier', 2],
    ["r4", '#redclasses .demoman', 1],
    ["r7", '#redclasses .medic', 1],
    ["rc", '#redclasses .charge', 1]
    ];

function setPoint(p) {
    point = p;

    var numBlue = p;
    if (numBlue >= 3) {
        numBlue -= 1;
    }
    var numRed = 6 - p;
    if (numRed >= 3) {
        numRed -= 1;
    }

    $('.cp').removeClass('bluecp');
    $('.cp').removeClass('redcp');
    $('.cp' + ':lt(' + numBlue + ')').addClass('bluecp');
    $('.cp' + ':gt(' + (4 - numRed) + ')').addClass('redcp');
    updateWP();
}

var state = [];
function dimAvatar(tag) {
    document.getElementById(tag + '-on').style.visibility = 'hidden';
    document.getElementById(tag + '-off').style.visibility = 'visible';
    var x = document.getElementById(tag + '-x');
    if (x) {
        x.style.visibility = 'visible';
    }
    document.getElementById(tag).onclick = function() {revivePlayer(tag);};
}
function undimAvatar(tag) {
    document.getElementById(tag + '-on').style.visibility = 'visible';
    document.getElementById(tag + '-off').style.visibility = 'hidden';
    var x = document.getElementById(tag + '-x');
    if (x) {
        x.style.visibility = 'hidden';
    }
    document.getElementById(tag).onclick = function() {killPlayer(tag);};
}
function killPlayer(tag) {
    dimAvatar(tag);
    document.getElementById(tag).onclick = function() {revivePlayer(tag);};
    state[tag.substr(0,2)] -= 1;

    if (tag.charAt(1) == '7') {
        document.getElementById(tag.charAt(0) + 'c-on').style.visibility = 'hidden';
        document.getElementById(tag.charAt(0) + 'c-off').style.visibility = 'hidden';
        // Don't force the uber off here.  Do it when sending the XHR,
        // so the UI maintains uber state.
    }
    updateWP();
}
function revivePlayer(tag) {
    undimAvatar(tag);
    state[tag.substr(0,2)] += 1;

    if (tag.charAt(1) == '7') {
        document.getElementById(tag.charAt(0) + 'c-on').style.visibility = 'hidden';
        document.getElementById(tag.charAt(0) + 'c-off').style.visibility = 'hidden';
        if (state[tag.charAt(0) + 'c'] > 0) {
            document.getElementById(tag.charAt(0) + 'c-on').style.visibility = 'visible';
        } else {
            document.getElementById(tag.charAt(0) + 'c-off').style.visibility = 'visible';
        }
    }
    updateWP();
}

var xhr = new XMLHttpRequest();
function updateWP() {
    xhr.abort();

    location.hash = createBookmark();

    document.all.loading.style.visibility = 'visible';
    var url = "backend.php?";

    var i;
    for (i = 0; i < stateKeys.length; i++) {
        tag = stateKeys[i][0];
        url += tag + "=";
        if (tag[1] == 'c' && state[tag[0] + '7'] == 0) {
            // No ubercharge if medic is dead.
            url += "0";
        } else {
            url += state[tag];
        }
        url += "&";
    }

    url += "map=" + escape($('#map')[0].value) + "&";
    url += "point=" + point;

    xhr.open("GET", url);
    xhr.onreadystatechange = recieveResponse;
    xhr.send();
}
function recieveResponse() {
    if (xhr.readyState == 4) {
	if (xhr.status == 200) {
	    if (xhr.responseText.indexOf("table") == -1) {
		// IE randomly strips the table tag from the responseText.
		// Put it back if it has been stripped.
		document.all.xhrTarget.innerHTML = "<table>" + xhr.responseText + "</table>";
	    } else {
		document.all.xhrTarget.innerHTML = xhr.responseText;
	    }
        } else {
        }
        document.all.loading.style.visibility = 'hidden';
    }
}

function loadBookmark(bookmark) {
    bookmark = bookmark.split('/');
    if (bookmark.length < 2) {
        return false;
    }
    $('#map')[0].value = bookmark[0];

    var incomingState = bookmark[1].split('');
    if (incomingState.length < 11) {
        return false;
    }

    point = parseInt(incomingState[0], 10);
    if (point < 1 || point > 5) {
        return false;
    }

    for (var i = 1; i < incomingState.length; i++) {
        var num = parseInt(incomingState[i], 10);
        state[stateKeys[i-1][0]] = num;
    }

    for (var i = 0; i < stateKeys.length; i++) {
        var key = stateKeys[i][0];
        var selector = stateKeys[i][1];
        var limit = stateKeys[i][2];
        if (key[1] == 'c') {
            $(selector).each(function(j) {
                if (j < state[key]) {
                    undimAvatar(this.id);
                }
            });
        }
        else {
            $(selector).each(function(j) {
                if (j < limit - state[key]) {
                    dimAvatar(this.id);
                }
            });
        }
    }

    setPoint(point);
    return true;
}

function createBookmark() {
    var bookmark = '#' + $('#map')[0].value + '/' + point;
    for (var i = 0; i < stateKeys.length; i++) {
        bookmark += state[stateKeys[i][0]];
    }
    return bookmark;
}

$(document).ready(function() {
    var bookmark = unescape(location.hash.substring(1));
    if (!loadBookmark(bookmark)) {
	loadBookmark('%/32211022110');
    }
});
