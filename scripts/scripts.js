class Card {
	constructor(_term, _definition) {
		this.term = _term;
		this.definition = _definition;
	}
}

var termElement;
var definitionElement;
var saveButton;

var cards = [];
var unusedCards = [];
var usedCards = [];
var savedCards = [];

//0 = not loaded, 1 = waiting to start unsaved, 2 = showing unsaved, 3 = waiting to start saved, 4 = showing saved, 5 = finished
var state = 0;
var isSaved = false;
var flipped = false;
var currentIndex = -1;
var restartAll = false;

function flip() {
	if(state == 2 || state == 4) {
		flipped = !flipped;
		if(!flipped) {
			termElement.style.opacity = 0;
		} else {
			termElement.style.opacity = 1;
		}
	}
}

function share() {
	window.prompt("Copy this link and share it.",window.location);
}

function restart() {
	isSaved = false;
	savedCards = [];
	state = 0;
	advance();
	setTimeout(function() {
		document.getElementById("advanceButton").style.display = "block";
		document.getElementById("count").innerHTML = "0";
		document.getElementById("current").innerHTML = cards.length;
		document.getElementById("progressBar").style.width = "0%";
		saveButton.style.display = "none";
	}, 100);
}

function toggleSaved() {
	if(state == 2 || state == 4) {
		isSaved = !isSaved;
		if(isSaved) {
			savedCards.push(unusedCards[currentIndex])
			saveButton.src = "images/unsave.png";
		} else {
			var i = 0;
			for(card of savedCards) {
				if(card == unusedCards[currentIndex]) {
					savedCards.splice(i, 1);
				}
				i++;
			}
			saveButton.src = "images/save.png";
		}
	}
}

function prev() {
	if(state == 2 || state == 4) {
		currentIndex = Math.max(0, currentIndex-1);
		definitionElement.style.opacity = 0;
		termElement.style.opacity = 0;
		setTimeout(function() {
			displayCard();
		}, 100);
	}
}

function next() {
	if(state == 2 || state == 4) {
		currentIndex++;
		if(currentIndex < unusedCards.length) {
			definitionElement.style.opacity = 0;
			termElement.style.opacity = 0;
			setTimeout(function() {
				displayCard();
			}, 100);
		} else {
			advance();
		}
	}
}

function displayCard() {
	document.getElementById("count").innerHTML = unusedCards.length;
	document.getElementById("current").innerHTML = currentIndex;
	document.getElementById("progressBar").style.width = ((currentIndex/unusedCards.length)*100)+"%";
	isSaved = savedCards.includes(unusedCards[currentIndex]);
   	saveButton.src = (isSaved)?"images/unsave.png":"images/save.png";
	flipped = false;
	
	definitionElement.style.opacity = 1;
	termElement.style.opacity = 0;
	termElement.innerHTML = unusedCards[currentIndex].term;
	definitionElement.innerHTML = unusedCards[currentIndex].definition;
}

function resetDeck(_cards) {
	usedCards = [];
	unusedCards = [];
	var tmp = _cards.slice();
	while(tmp.length != 0) {
		var i = Math.floor(Math.random()*tmp.length);
		unusedCards.push(tmp[i]);
		tmp.splice(i, 1);
	}
	currentIndex = 0;
}

function setAllCardsView() {
	var container = document.getElementById("allCardsView");
	container.innerHTML = "";
	for(card of cards) {
		var c = document.createElement("div");
		c.className = "previewCardContainer";
		var d = document.createElement("div");
		d.className = "previewCard";
		var t = document.createElement("p");
		t.className = "previewTerm";
		t.innerHTML = "<b>"+card.term+"</b>";
		var def = document.createElement("p");
		def.innerHTML = card.definition;
		d.appendChild(t);
		d.appendChild(def);
		c.appendChild(d);
		container.appendChild(c);
	}
}

function setCards(text, name) {
	var d = new Date();
	d.setTime(d.getTime() + (30*24*60*60*1000));
	
	if(name != undefined) {
		document.getElementById("title").innerHTML = name.split(".")[0];
	}

	var lines = text.split("\n");
	for(line of lines) {
		var spl = line.split("\t");
		cards.push(new Card(spl[0], spl[1]));
	}
	setAllCardsView();
	state = 0;
	setTimeout(function() {
		advance();
	}, 500);
}

function loadCards() {
	var p = "";
	while(p == "") {
		p = window.prompt("enter a gist url");
	}
	
	if(p != null) {
	
		console.log(p);
		
		var spl = p.split("/");
		var id = (spl[4]);
		
		var r = new XMLHttpRequest();
		r.open("GET","https://api.github.com/gists/"+id,true);
		r.onreadystatechange = function() {
			if(this.readyState == 4 && this.status == 200) {
				var res = JSON.parse(this.response);
				console.log(res);
				console.log(res.id);
				for(key in res.files) {
					window.location = "https://www.jwhamilton.co/flashcards?cards="+res.id;
					break;
				}
			}
		}
		r.send();
	}
	// var picker = document.createElement("input");
	// picker.type = "file";
	// picker.onchange = e => {
	// 	var file = e.target.files[0];
	// 	if(file != undefined) {
	// 		if(file.type == "text/plain") {
	// 			var reader =  new FileReader();
	// 			reader.readAsText(e.target.files[0], "UTF-8");
	// 			reader.onload = r => {
	// 				var result = r.target.result;
	// 				var u = (URL.createObjectURL(new Blob([result], {type:"text/plain"})));
	// 				console.log(u);
	// 				var r = new XMLHttpRequest();
	// 				r.open("GET",u,true);
	// 				r.onreadystatechange = function() {
	// 					if(this.readyState == 4 && this.status == 200) {
	// 						console.log(this.response);
	// 					}
	// 				}
	// 				r.send();
	// 				//window.location = window.location+"?cards="+btoa(encodeURIComponent(result))+"&name="+btoa(encodeURIComponent(e.target.files[0].name));
	// 			}
	// 		} else {
	// 			window.alert("please only load plaintext (.txt) files");
	// 		}
	// 	} else {
	// 		window.alert("could not find file");
	// 	}
	// }
	// picker.click();
}

function advance() {
	var c = document.getElementById("content");
	c.style.opacity = 0;
	if(state == 1 || state == 3 || state == 5) {
		termElement.style.opacity = 0;
	} else {
		termElement.style.opacity = 1;
	}
	setTimeout(function() {
		switch(state) {
			case 0:
				if(cards.length != 0) {
					console.log("advancing to start");
					document.getElementById("card").style.cursor = "default";
					document.getElementById("definition").style.display = "none";
					document.getElementById("secondaryLoadButton").style.display = "none";
					document.getElementById("advanceButton").style.display = "block";
					document.getElementById("allCardsContainer").style.display = "block";
					document.getElementById("count").innerHTML = cards.length;
					document.getElementById("current").innerHTML = "0";
					document.getElementById("progressBar").style.width = "0%";
					termElement.innerHTML = "All Cards";
					definitionElement.innerHTML = "Press \"Start\" To Begin!";
					document.getElementById("advanceButton").innerHTML = "Start Studying";
					document.getElementById("footer").style.display = "none";
					state = 1;
					break;
				}
			case 1:
				document.getElementById("secondaryLoadButton").style.display = "none";
				document.getElementById("advanceButton").style.display = "none";
				document.getElementById("definition").style.display = "block";
				document.getElementById("allCardsContainer").style.display = "none";
				document.getElementById("card").style.cursor = "pointer";
				saveButton.style.display = "block";
				document.getElementById("footer").style.display = "block";
				resetDeck(cards);
				displayCard();
				state = 2;
				break;
			case 2:
				document.getElementById("card").style.cursor = "default";
				document.getElementById("advanceButton").style.display = "block";
				saveButton.style.display = "none";
				document.getElementById("count").innerHTML = unusedCards.length;
				document.getElementById("current").innerHTML = currentIndex;
				document.getElementById("progressBar").style.width = ((currentIndex/unusedCards.length)*100)+"%";
				document.getElementById("footer").style.display = "none";
				if(savedCards.length == 0) {
					console.log("advancing to finish");		document.getElementById("advanceButton").innerHTML = "Restart";
					termElement.innerHTML = "Finished!";
					definitionElement.innerHTML = "Load another set or restart this one.";
					state = 5;
				} else {
					termElement.innerHTML = "Study Saved?";
					definitionElement.innerHTML = "Study your "+savedCards.length+" saved card"+((savedCards.length == 1) ? "" : "s")+"?";
					document.getElementById("advanceButton").innerHTML = "Study Saved";
					console.log("advancing to waiting to start saved");
					state = 3;
				}
				break;
			case 3:
				document.getElementById("advanceButton").style.display = "none";
				document.getElementById("card").style.cursor = "pointer";
				document.getElementById("definition").style.display = "block";
				saveButton.style.display = "block";
				console.log("advancing to showing saved");
				document.getElementById("footer").style.display = "block";
				resetDeck(savedCards);
				displayCard();
				state = 4;
				break;
			case 4:
				document.getElementById("card").style.cursor = "default";
				document.getElementById("advanceButton").style.display = "block";
				saveButton.style.display = "none";
				termElement.style.display = "block";
				document.getElementById("footer").style.display = "none";
				if(savedCards.length == 0) {
					termElement.innerHTML = "Finished!";
					definitionElement.innerHTML = "Load another set or restart this one.";		document.getElementById("advanceButton").innerHTML = "Restart";
					console.log("advancing to finished");
					state = 5;
				} else {
					termElement.innerHTML = "Restart?";
					definitionElement.innerHTML = "You still have "+savedCards.length+" saved card"+((savedCards.length == 1) ? "" : "s")+".";
					document.getElementById("advanceButton").innerHTML = "Study Saved";
					console.log("advancing to waiting to start saved");
					state = 3;
				}
				break;
			case 5:
				document.getElementById("advanceButton").style.display = "none";
				document.getElementById("card").style.cursor = "pointer";
				console.log("advancing to showing unsaved");
				document.getElementById("footer").style.display = "block";
				saveButton.style.display = "block";
				resetDeck(cards);
				displayCard();
				state = 2;
				break;
		}
		
		var c = document.getElementById("content");
		c.style.opacity = 1;
	}, 100);
}

window.onload = function() {
	termElement = document.getElementById("term");
	definitionElement = document.getElementById("definition");
	saveButton = document.getElementById("saveButton");
	
	var params = new URLSearchParams(window.location.search);
	
	if(params.has("cards")) {
		termElement.innerHTML = "Loading cards...";
		definitionElement.innerHTML = "Getting cards from gist...";
		document.getElementById("secondaryLoadButton").style.display = "none";
		
		var r = new XMLHttpRequest();
		r.open("GET","https://api.github.com/gists/"+params.get("cards"),true);
		r.onreadystatechange = function() {
			if(this.readyState == 4 && this.status == 200) {
				var res = JSON.parse(this.response);
				
				for(key in res.files) {
					setCards(res.files[key].content, key);
					break;
				}
			}
		}
		r.send();
	}
}

function flipFromKey() {
	if(state == 2 || state == 4) {
		flip();
	}
}

function saveFromKey() {
	if(state == 2 || state == 4) {
		toggleSaved();
	}
}

function advanceFromKey(dir) {
	if(dir) {
		if(state == 2 || state == 4) {
			next();
		} else {
			advance();
		}
	} else {
		if(state == 2 || state == 4) {
			prev();
		}
	}
}

document.onkeydown = function(e) {
	switch(e.code) {
		case "ArrowUp":
			flipFromKey();
			break;
		case "ArrowDown":
			flipFromKey();
			break;
		case "ArrowLeft":
			advanceFromKey(false);
			break;
		case "ArrowRight":
			advanceFromKey(true);
			break;
		case "Space":
			flipFromKey();
			break;
		case "KeyS":
			saveFromKey();
			break;
	}
}