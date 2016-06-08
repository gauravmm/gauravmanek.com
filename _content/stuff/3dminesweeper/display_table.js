var mainNode;
var displayNode;

var display_stageW = 708;
var display_stageH = 708;

var tableNode;			// Super table node
var rowNodes;			// Stored as rowNodes[y] 	= node
var childNodes; 		// Stored as rowNodes[y][x] = node - most of the time, this will be used.
var zSelectNodes; 		// Nodes that represent the z-selector

var display_minestring = '<img src="./mine.png" alt="Mine!" />';

if (typeof document.onselectstart!="undefined") {
  document.onselectstart=new Function ("return false");
}
else{
  document.onmousedown=new Function ("return false");
  document.onmouseup=new Function ("return true");
}


function display_config(){
	size_X = parseInt(prompt("Width of space", size_X), 10);
	size_Y = parseInt(prompt("Height of space", size_Y), 10);
	size_Z = parseInt(prompt("Depth of space", size_Z), 10);

	numMinesTotal = prompt("Number of Mines", numMinesTotal);
	
	gameStart();
}
function display_initialize(){
  
	if(tableNode != null)
		mainNode.removeChild(tableNode);
	
	if(zSelectNodes != null)
		for(var i = 0; i < zSelectNodes.length; ++i)
			displayNode.removeChild(zSelectNodes[i]);
	
	// Draw in table
	mainNode = document.getElementById("mainDiv");
	displayNode = document.getElementById("displayDiv");
	tableNode = document.createElement("table");
	
	mainNode.appendChild(tableNode);
	
	tableNode.border = "1";
	tableNode.cellSpacing = "4";
	
	rowNodes = new Array();
	childNodes = new Array();
	zSelectNodes = new Array();
	
	for(var i = size_Z - 1; i >= 0; --i){
		zSelectNodes[i] = document.createElement("div");
		zSelectNodes[i].className = "unselected";
		zSelectNodes[i].innerHTML = "<b>" + i + "</b>";
		zSelectNodes[i].setAttribute("onclick", "display_clickHandleZSelect(" + i + ")", 0);
		displayNode.appendChild(zSelectNodes[i]);
	}
	zSelectNodes[0].className = "selected";
	
	for(var j = 0; j < size_Y; ++j){
		rowNodes[j] = document.createElement("tr");
		tableNode.appendChild(rowNodes[j]);
		childNodes[j] = new Array();
		
		for(var i = 0; i < size_X; ++i){
			childNodes[j][i] = document.createElement("td");
			childNodes[j][i].className = "covered";
			childNodes[j][i].innerHTML = "";
			childNodes[j][i].width = (708 - (size_X-1)*4)/size_X;
			childNodes[j][i].height =(708 - (size_X-1)*4)/size_Y;
			childNodes[j][i].setAttribute("onclick", "display_clickHandleSingle(event, " + i + "," + j + ")", 0);
			rowNodes[j].appendChild(childNodes[j][i]);
		}	
	}
	display_updateStats();
	display_Z_slice(current_z);
}

function display_Z_slice(current_z){			// Use current_z to display the slice.
	for(var j = 0; j < size_Y; ++j)
		for(var i = 0; i < size_X; ++i){
			if(freezeStats || (gameBoard[current_z][j][i] & 2) == 2){
				// Clear the current child and add a new text node.
				
				if((gameBoard[current_z][j][i] & 1) == 1)
					childNodes[j][i].innerHTML = display_minestring;
				else
					childNodes[j][i].innerHTML = "<b>" + ((gameBoardNumbers[current_z][j][i] == 0)?"":gameBoardNumbers[current_z][j][i] ) + "</b>";
				
				childNodes[j][i].className = "uncovered";
			} else if((gameBoard[current_z][j][i] & 4) == 4) {
				childNodes[j][i].innerHTML = "";
				childNodes[j][i].className = "flagged";
			} else {
				childNodes[j][i].innerHTML = "";
				childNodes[j][i].className = "covered";
			}
			//childNodes[j][i].innerHTML = "<b>" + gameBoardNumbers[current_z][j][i] + "</b>";
		}
}

function display_clickHandleSingle(oEvent, x, y){
	if (oEvent.shiftKey)
		game_altClick(x, y, current_z);
    else 
		game_singleClick(x, y, current_z);
	
	
	display_Z_slice(current_z);
	display_updateStats();
}

function display_clickHandleZSelect(z){
	current_z = z;
	for(i = 0; i < size_Z; ++i)
		zSelectNodes[i].className = (i==z)?"selected":"unselected";
	display_Z_slice(current_z);
}

function display_updateStats(){
	document.getElementById("stats_flagged").innerHTML = flagCount + "/" + numMinesTotal;
	document.getElementById("stats_cleared").innerHTML = Math.floor(100*clearCount/(size_X*size_Y*size_Z - numMinesTotal)) + "%";
}
function display_updateTime(){
	if(freezeStats)
		return;
	document.getElementById("stats_time").innerHTML = Math.floor(((new Date()).getTime() - startTime)/1000) + "s";
}
setInterval("display_updateTime()", 250);
function display_victory(){
	alert("You Win!");
}	function display_failure(){
	alert("You hit a mine! Boom!");
}