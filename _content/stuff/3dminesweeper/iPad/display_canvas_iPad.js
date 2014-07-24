var mainNode;
var displayNode;

var display_stageW = 728;
var display_stageH = 728;

var display_pickerW = 240;
var display_pickerH = 240;
var display_pickerWidth = 108;
var display_pickerHeight = 108;

var draw_W;				// Written to in display_Z_slice.
var draw_H;
var draw_offsetX;
var draw_offsetY;

var draw_minFontSize = 24;
var draw_maxFontSize = 36;

var draw_flagColor = "#FB0";
var draw_coveredColor = "#333";

var draw_solidColor = "#FFF";
var draw_solidColorFaded = "#666";

var draw_solidColorFaded = "#666";

var draw_anaglyphOffsetMax = -4;
var draw_anaglyphOffsetMin = 4;
var draw_anaglyphL = "#F00";
var draw_anaglyphR = "#0AA";
var draw_anaglyphLFaded = "#800";
var draw_anaglyphRFaded = "#055";

var current_z = 0;

var draw_anaglyph = true;				// Anaglyph rendering option, relies on "cx.globalCompositeOperation = 'lighter';" for correct blending.
										// Note that, for the hit area, left eye is assumed to be the primary eye.

var canvasNode;			// Canvas node. What else did you expect?
var cx;					// Canvas 2d Context
var pickerCvNode;		// Canvas node for z-slice picker.
var pcx;				// Canvas 2d Context

var zSelectNodes; 		// Nodes that represent the z-selector

var ani_ActiveMovement = false;

var met_isiPad = (navigator.userAgent.indexOf("iPad") != -1);
// var display_minestring = '<img src="./mine.png" alt="Mine!" />';


function display_config(){
	size_X = parseInt(prompt("Width of space", size_X), 10);
	size_Y = parseInt(prompt("Height of space", size_Y), 10);
	size_Z = parseInt(prompt("Depth of space", size_Z), 10);

	numMinesTotal = prompt("Number of Mines", numMinesTotal);
	
	gameStart();
}
function display_initialize(){
	if(!met_isiPad){
		alert("This game is designed to run on an iPad! Please visit this page on an iPad to enjoy the full experience.");
	}
	if(met_isiPad && !window.navigator.standalone){
		document.getElementById("mainDiv").style.display = "none";
		document.getElementById("holder").style.display = "none";
		
		var m = new Image();
		m.src = "add-to-homescreen.png";
		m.id="homescreen";
		document.body.appendChild(m);
		//document.getElementsByTagName("body")[0].appendChild(m);
		return;
	}
	
	// Draw in table
	mainNode = document.getElementById("mainDiv");
	displayNode = document.getElementById("displayDiv");
	
	if(canvasNode == null){
		canvasNode = document.createElement("canvas");
		canvasNode.width = display_stageW;
		canvasNode.height = display_stageH;
		canvasNode.setAttribute("onselectstart", "return false", 0);
		
		if(met_isiPad) {
			canvasNode.setAttribute("onclick", "void()");
			canvasNode.addEventListener("touchstart", function(e){return touch_clickHandleSingleStart(e)}, false);
			canvasNode.addEventListener("touchmove", function(e){return touch_clickHandleSingleMove(e)}, false);
			canvasNode.addEventListener("touchend", function(e){return touch_clickHandleSingleEnd(e)}, false);
		} else {
			canvasNode.setAttribute("onclick", "display_clickHandleSingle(event)", 0);
		}
		
		mainNode.appendChild(canvasNode);
	}
	cx = canvasNode.getContext("2d");
	
	if(zSelectNodes != null)
		for(var i = 0; i < zSelectNodes.length; ++i)
			displayNode.removeChild(zSelectNodes[i]);
	
	zSelectNodes = new Array();
	
	displayNode.width = display_pickerW;
	displayNode.height = display_pickerH;
	
	var stepSizeX = (display_pickerW - display_pickerWidth)/size_Z;
	var stepSizeY = (display_pickerH - display_pickerHeight)/size_Z;
	for(var i = 0; i < size_Z; ++i){
		zSelectNodes[i] = document.createElement("div");
		zSelectNodes[i].className = "unselected";
		zSelectNodes[i].innerHTML = "<b>" + (i+1) + "</b>";
		if(met_isiPad) {
			zSelectNodes[i].setAttribute("onclick", "void()");
			zSelectNodes[i].addEventListener("touchstart", function(e){return touch_clickHandleZSelect(e)}, false);
		} else {
			zSelectNodes[i].setAttribute("onclick", "display_clickHandleZSelect(" + i + ")", 0);
		}
			
		zSelectNodes[i].setAttribute("onselectstart", "return false", 0);
		zSelectNodes[i].style.right = Math.round(stepSizeX * i) + "px";
		zSelectNodes[i].style.top = Math.round(stepSizeY * i) + "px";
		zSelectNodes[i].style.width = display_pickerWidth + "px";
		zSelectNodes[i].style.height = display_pickerHeight + "px";
		zSelectNodes[i].no = i;
		
		displayNode.appendChild(zSelectNodes[i]);
	}
	zSelectNodes[0].className = "selected";
	
	document.getElementById("update_date").innerHTML = php_date;
	
	toggleAnaglyph(draw_anaglyph);
	
	display_updateStats();
	display_Z_slice(current_z);
	
	touch_initialize();
}

function display_Z_slice(current_z){			// Use current_z to display the slice.
	if(isNaN(current_z)) return;
	// Clear before starting
	cx.clearRect(0, 0, display_stageW, display_stageH);
	cx.lineCap = "square"; // butt, square, round
	
	var draw_minSquare = new Array(display_stageW * 0.15, display_stageH * 0.15, display_stageW * 0.7, display_stageH * 0.7); //  x, y, width, height
	var draw_maxSquare = new Array(display_stageW * 0.025, display_stageH * 0.025, display_stageW * 0.95, display_stageH * 0.95); //  x, y, width, height
	
	// Linear interpolation: min + (max-min) *current_z / (size_Z - 1)
	
	draw_W = draw_minSquare[2] + (draw_maxSquare[2] - draw_minSquare[2]) * current_z / (size_Z - 1);			// Used for the hittest, do not change anywhere else
	draw_H = draw_minSquare[3] + (draw_maxSquare[3] - draw_minSquare[3]) * current_z / (size_Z - 1);
	draw_offsetX = draw_minSquare[0] + (draw_maxSquare[0] - draw_minSquare[0]) * current_z / (size_Z - 1);
	draw_offsetY = draw_minSquare[1] + (draw_maxSquare[1] - draw_minSquare[1]) * current_z / (size_Z - 1);
	
	var draw_lineW = 4; // TODO: Need to make the flagged and covered sq functions account for the line width.
	
	// Draw the environment
	if(draw_anaglyph){
		cx.globalCompositeOperation = "lighter";
		
		draw_box(draw_anaglyphLFaded, draw_lineW, draw_minSquare, draw_maxSquare, false);
		draw_box(draw_anaglyphRFaded, draw_lineW, draw_minSquare, draw_maxSquare, true);
		
		draw_grid(draw_anaglyphL, draw_lineW, size_X, size_Y, draw_offsetX, draw_offsetY, draw_W, draw_H);
		draw_grid(draw_anaglyphR, draw_lineW, size_X, size_Y, draw_offsetX + draw_calcAnaglyphOffset(current_z), draw_offsetY, draw_W, draw_H);
	} else {
		draw_box(draw_solidColorFaded, draw_lineW, draw_minSquare, draw_maxSquare, false);
		draw_grid(draw_solidColor, draw_lineW, size_X, size_Y, draw_offsetX, draw_offsetY, draw_W, draw_H);
	}
	
	// Draw the numbers in.
	var anaglyphOffset = draw_anaglyph?draw_calcAnaglyphOffset(current_z):0;
	cx.font = Math.round(draw_minFontSize + (draw_maxFontSize-draw_minFontSize)*current_z/(size_Z - 1)) + "px bold sans-serif";
	
	// if(ani_ActiveMovement) return;
	// Use the closest valid layer to draw.
	var current_z_r = Math.max(Math.min(Math.round(current_z), size_Z-1), 0);
	
	for(var j = 0; j < size_Y; ++j)
		for(var i = 0; i < size_X; ++i){
			if(freezeStats || (gameBoard[current_z_r][j][i] & 2) == 2){
				if((gameBoard[current_z_r][j][i] & 1) == 1)
					draw_text(i, j, "B", anaglyphOffset);
				else if(gameBoardNumbers[current_z_r][j][i] != 0 && !ani_ActiveMovement)
					draw_text(i, j, gameBoardNumbers[current_z_r][j][i], anaglyphOffset);
			} else if((gameBoard[current_z_r][j][i] & 4) == 4) {
				draw_flaggedSq(i, j);
			} else {
				draw_coveredSq(i, j);
			}
		}
}
function draw_calcAnaglyphOffset(z) {
	return draw_anaglyphOffsetMin + (draw_anaglyphOffsetMax-draw_anaglyphOffsetMin) * z / (size_Z - 1); // Assume linear interpolation
}
function draw_text(x, y, text, xoffset){
	if(xoffset == 0){
		cx.fillStyle = draw_solidColor;
		cx.fillText(text, xoffset + draw_offsetX +  (x + 0.5) * draw_W/size_X, draw_offsetY + draw_H/size_Y*(y+0.5));
		return;
	}
	
	cx.fillStyle = draw_anaglyphL;
	cx.fillText(text, draw_offsetX +  (x + 0.5) * draw_W/size_X, draw_offsetY + draw_H/size_Y*(y+0.5));
	cx.fillStyle = draw_anaglyphR;
	cx.fillText(text, xoffset + draw_offsetX +  (x + 0.5) * draw_W/size_X, draw_offsetY + draw_H/size_Y*(y+0.5));
}
function draw_flaggedSq(x, y){
	cx.fillStyle = draw_flagColor;
	cx.fillRect(draw_offsetX +  x * draw_W/size_X , draw_offsetY + draw_H/size_Y*y, draw_W/size_X,  draw_H/size_Y);
}
function draw_coveredSq(x, y){
	cx.fillStyle = draw_coveredColor;
	cx.fillRect(draw_offsetX +  x * draw_W/size_X, draw_offsetY + draw_H/size_Y*y, draw_W/size_X,  draw_H/size_Y);
}
function draw_box(color, lineW, minSq, maxSq, useAnaglyphOffset){  // minsq, maxsq: array(x, y, width, height)
	cx.strokeStyle = color;
	cx.lineWidth = lineW;  
	
	// Draw min square, using anaglyph offset if need be
	
	// a, b are the anaglyph corrections for sqMin and sqMax respectively
	var a = useAnaglyphOffset?draw_calcAnaglyphOffset(0):0;
	var b = useAnaglyphOffset?draw_calcAnaglyphOffset(size_Z-1):0;
	
	// Draw sqMin
	cx.beginPath();
	cx.moveTo(minSq[0] + a,				minSq[1]);
	cx.lineTo(minSq[0] + a,				minSq[1] + minSq[3]);
	cx.lineTo(minSq[0] + minSq[2] + a, 	minSq[1] + minSq[3]);
	cx.lineTo(minSq[0] + minSq[2] + a, 	minSq[1]);
	cx.lineTo(minSq[0] + a,			 	minSq[1]);
	
	// Draw sqMax
	cx.moveTo(maxSq[0] + b,				maxSq[1]);
	cx.lineTo(maxSq[0] + b,				maxSq[1] + maxSq[3]);
	cx.lineTo(maxSq[0] + maxSq[2] + b, 	maxSq[1] + maxSq[3]);
	cx.lineTo(maxSq[0] + maxSq[2] + b, 	maxSq[1]);
	cx.lineTo(maxSq[0] + b,			 	maxSq[1]);
	
	// Draw joining lines
	cx.moveTo(maxSq[0] + b,				maxSq[1]);
	cx.lineTo(minSq[0] + a,			 	minSq[1]);
	cx.moveTo(maxSq[0] + maxSq[2] + b,	maxSq[1]);
	cx.lineTo(minSq[0] + minSq[2] + a,	minSq[1]);
	cx.moveTo(maxSq[0] + b,				maxSq[1] + maxSq[3]);
	cx.lineTo(minSq[0] + a,			 	minSq[1] + minSq[3]);
	cx.moveTo(maxSq[0] + maxSq[2] + b,	maxSq[1] + maxSq[3]);
	cx.lineTo(minSq[0] + minSq[2] + a,	minSq[1] + minSq[3]);
	
	// Note: change mitrelimit
	
	cx.stroke();
}
function draw_grid(color, lineW, sizeX, sizeY, drawOffsetX, drawOffsetY, drawW, drawH){
	cx.strokeStyle = color;
	cx.lineWidth = lineW;  
	cx.beginPath();
	
	var draw_cellW = drawW/(sizeX);
	var draw_cellH = drawH/(sizeY);
	
	for(var i = 0; i <= size_X; ++i){
		cx.moveTo(drawOffsetX, 			drawOffsetY + i*draw_cellH);
		cx.lineTo(drawOffsetX + drawW, 	drawOffsetY + i*draw_cellH);
	}
	for(var i = 0; i <= size_Y; ++i){
		cx.moveTo(drawOffsetX + i*draw_cellW, drawOffsetY);
		cx.lineTo(drawOffsetX + i*draw_cellW, drawOffsetY + drawH);
	}
	cx.stroke();
}

function display_clickHandleSingle(oEvent){
	// 
	pos_x = oEvent.offsetX?(oEvent.offsetX):oEvent.pageX-canvasNode.offsetLeft;
	pos_y = oEvent.offsetY?(oEvent.offsetY):oEvent.pageY-canvasNode.offsetTop;

	// Caclulate cell here.
	x = Math.floor((pos_x - draw_offsetX) /draw_W * size_X);
	if(x < 0 || x >= size_X)
		return;
	y = Math.floor((pos_y - draw_offsetY) /draw_H * size_Y);
	if(y < 0 || y >= size_Y)
		return;
	
	var current_z_r = Math.max(Math.min(Math.round(current_z), size_Z-1), 0);
	
	if (oEvent.shiftKey)
		game_altClick(x, y, current_z_r);
    else 
		game_singleClick(x, y, current_z_r);
	
	
	display_Z_slice(current_z);
	display_updateStats();
}

function display_clickHandleZSelect(z){
	for(i = 0; i < size_Z; ++i)
		zSelectNodes[i].className = (i==z)?"selected":"unselected";
	//display_Z_slice(current_z);
	ani_moveToTargetZ(z)
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
function toggleAnaglyph(endstate) {
	if(endstate === undefined)
		draw_anaglyph=!draw_anaglyph;
	else
		draw_anaglyph = endstate;
	
	if(draw_anaglyph)
		document.getElementById("button_anagl").className = "on";
	else
		document.getElementById("button_anagl").className = "off";

	//document.getElementById("button_anagl").state = (draw_anaglyph)?"on":"off"
	display_Z_slice(current_z);
}

/*******************
 * Animation Functions
 *******************/
 
var ani_timer1;

function ani_moveToTargetZ(tgtZ){
	if(isNaN(tgtZ)) return;
	if(Math.abs(current_z-tgtZ) < 0.1){
		current_z = tgtZ;
		ani_ActiveMovement = false;
		display_Z_slice(current_z);
		return;
	}
	current_z = (current_z + tgtZ)/2;
	display_Z_slice(current_z);
	// Check timer
	clearTimeout(ani_timer1);
	//ani_ActiveMovement=true;
	ani_timer1 = setTimeout("ani_moveToTargetZ(" + tgtZ + ")", 40);	
}