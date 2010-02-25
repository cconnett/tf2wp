var point = 3;

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

var players = [];
function killPlayer(tag) {
    document.getElementById(tag + '-on').style.visibility = 'hidden';
    document.getElementById(tag + '-off').style.visibility = 'visible';
    document.getElementById(tag + '-x').style.visibility = 'visible';
    document.getElementById(tag).onclick = function() {revivePlayer(tag);};
    players[tag.substr(0,2)] -= 1;

    if (tag.charAt(1) == '7') {
        document.getElementById(tag.charAt(0) + 'c-on').style.visibility = 'hidden';
        document.getElementById(tag.charAt(0) + 'c-off').style.visibility = 'hidden';
        // Don't force the uber off here.  Do it when sending the XHR,
        // so the UI maintains uber state.
    }
    updateWP();
}
function revivePlayer(tag) {
    document.getElementById(tag + '-on').style.visibility = 'visible';
    document.getElementById(tag + '-off').style.visibility = 'hidden';
    document.getElementById(tag + '-x').style.visibility = 'hidden';
    document.getElementById(tag).onclick = function() {killPlayer(tag);};
    players[tag.substr(0,2)] += 1;

    if (tag.charAt(1) == '7') {
        document.getElementById(tag.charAt(0) + 'c-on').style.visibility = 'hidden';
        document.getElementById(tag.charAt(0) + 'c-off').style.visibility = 'hidden';
        if (players[tag.charAt(0) + 'c'] > 0) {
            document.getElementById(tag.charAt(0) + 'c-on').style.visibility = 'visible';
        } else {
            document.getElementById(tag.charAt(0) + 'c-off').style.visibility = 'visible';
        }
    }
    updateWP();
}

function giveUber(tag) {
    document.getElementById(tag + '-on').style.visibility = 'visible';
    document.getElementById(tag + '-off').style.visibility = 'hidden';
    document.getElementById(tag).onclick = function() {dropUber(tag);};
    players[tag] += 1;
    updateWP();
}
function dropUber(tag) {
    document.getElementById(tag + '-on').style.visibility = 'hidden';
    document.getElementById(tag + '-off').style.visibility = 'visible';
    document.getElementById(tag).onclick = function() {giveUber(tag);};
    players[tag] -= 1;
    updateWP();
}

var xhr = new XMLHttpRequest();
function updateWP() {
    xhr.abort();

    document.all.loading.style.visibility = 'visible';
    var url = "backend.php?";

    var sides = ["b","r"];
    var positions = ["1","2","4","7","c"];

    var s;
    var i;
    for (s = 0; s < sides.length; s++) {
        for (i = 0; i < positions.length; i++) {
            tag = sides[s] + positions[i];
            url += tag + "=";
            if (positions[i] == 'c' && players[sides[s] + '7'] == 0) {
                // No ubercharge if medic is dead.
                url += "0";
            } else {
                url += players[tag];
            }
            url += "&";
        }
    }

    url += "map=" + escape(document.all.map[document.all.map.selectedIndex].value) + "&";
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
$(document).ready(function() {
    bookmark = location.hash.substring(1);
    players["b1"] = 2;
    players["b2"] = 2;
    players["b4"] = 1;
    players["b7"] = 1;
    players["bc"] = 0;

    players["r1"] = 2;
    players["r2"] = 2;
    players["r4"] = 1;
    players["r7"] = 1;
    players["rc"] = 0;
    setPoint(3);
})
