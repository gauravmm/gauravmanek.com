var touch_maximumTouchDurationForSingleClick = 700;
var touch_maximumMovementDuringRotate = 30; // Minimum movement before Move gesture is invoked
var touch_minimumAngleRotate = Math.PI/6;
var touch_minimumTouchDistanceForRotate = 20;
var touch_maximumTouchDistanceForRotate = 300;

var touch_maximumTouchDistanceForMove = 200;
var touch_stickingDistanceForMove = touch_maximumMovementDuringRotate;

touch_maximumMovementDuringRotate *= touch_maximumMovementDuringRotate;
touch_minimumTouchDistanceForRotate *= touch_minimumTouchDistanceForRotate;
touch_maximumTouchDistanceForRotate *= touch_maximumTouchDistanceForRotate;
touch_maximumTouchDistanceForMove *= touch_maximumTouchDistanceForMove;
touch_stickingDistanceForMove *= touch_stickingDistanceForMove;

var lastTouched = -1;
var lastRotate = -1;
var lastScrolled = -1;
var touch_timer1 = 0;
var TWOPI = Math.PI * 2;
var NEGPI = Math.PI * -1;

function inelligibleTouch_Click(){
	lastTouched = -1;
	clearTimeout(touch_timer1);
}
function touch_initialize(){
	return;
}

function touch_clickHandleZSelect(e){
	e.preventDefault();
	if(e.targetTouches.length != 1)
		return;
	display_clickHandleZSelect(e.targetTouches[0].target.no);
}

/* Canvas Touches - Single and Rotate */
function touch_clickHandleSingleStart(e){
	e.preventDefault();
	if(e.targetTouches.length == 0 || e.targetTouches.length > 2)
		return;
	
	pos_x = e.targetTouches[0].pageX-canvasNode.offsetLeft;
	pos_y = e.targetTouches[0].pageY-canvasNode.offsetTop;
	
	if(e.targetTouches.length == 2){
		lastScrolled =  new Array(-1, -1, e.targetTouches[0].pageX, e.targetTouches[0].pageY);
		lastScrolled[4] = (e.targetTouches[0].pageX + e.targetTouches[1].pageX)/2;
		lastScrolled[5] = (e.targetTouches[0].pageY + e.targetTouches[1].pageY)/2;
		lastScrolled[6] = false; // Has unstuck itself.
		lastScrolled[7] = current_z; // Has unstuck itself.
		lastScrolled[8] = -1;
	}
	
	// Caclulate cell here.
	x = Math.floor((pos_x - draw_offsetX) /draw_W * size_X);
	if(x < 0 || x >= size_X)
		return;
	y = Math.floor((pos_y - draw_offsetY) /draw_H * size_Y);
	if(y < 0 || y >= size_Y)
		return;
	
	lastTouched = new Array(x, y, e.targetTouches[0].pageX, e.targetTouches[0].pageY);
		
	if(e.targetTouches.length == 1){
		elligibleSingleClick = true;
		clearTimeout(touch_timer1);
		touch_timer1 = setTimeout("inelligibleTouch_Click()", touch_maximumTouchDurationForSingleClick);
	} else if(e.targetTouches.length == 2){
		lastRotate = lastTouched;
		lastRotate[4] = getAngleFromPoints(e.targetTouches[0].pageX, e.targetTouches[0].pageY, e.targetTouches[1].pageX, e.targetTouches[1].pageY);
		lastRotate[5] = Math.max(Math.min(Math.round(current_z), size_Z-1), 0);
		
		lastTouched = -1;
	}
}
function touch_clickHandleSingleMove(e){
	e.preventDefault();
	
	if(lastScrolled != -1){
		if(lastScrolled[6]){
			//var avCo = new Array((e.targetTouches[0].pageX + e.targetTouches[1].pageX)/2, (e.targetTouches[0].pageY + e.targetTouches[1].pageY)/2);
			if(ptDistSq(e.targetTouches[0].pageX,e.targetTouches[1].pageX,e.targetTouches[0].pageY,e.targetTouches[1].pageY) < touch_maximumTouchDistanceForMove) {
				var disp = ((e.targetTouches[0].pageY + e.targetTouches[1].pageY)/2-lastScrolled[5])/display_stageH*(size_Z+1);
				// document.getElementById("Instructions").innerHTML = disp;
				current_z =	Math.max(Math.min(lastScrolled[7] + disp, size_Z-1), 0);
				display_Z_slice(current_z);
			} else
				lastScrolled = -1;
		} else 
			if (ptDistSq(e.targetTouches[0].pageX, lastScrolled[2], e.targetTouches[0].pageY, lastScrolled[3]) > touch_stickingDistanceForMove){
				lastScrolled[6] = true;
				lastRotate = -1;
			}
	}
	if(lastRotate != -1){
		if(e.targetTouches.length == 2){
			// Check for touch[0] movement, touch[1] rotation
			if(ptDistSq(e.targetTouches[0].pageX, lastRotate[2], e.targetTouches[0].pageY, lastRotate[3]) <= touch_maximumMovementDuringRotate) {
				var pFgDist = ptDistSq(e.targetTouches[0].pageX, e.targetTouches[1].pageX, e.targetTouches[0].pageY, e.targetTouches[1].pageY);
				if(pFgDist >= touch_minimumTouchDistanceForRotate && pFgDist <= touch_maximumTouchDistanceForRotate){ // Within distance bounds
					var alpha = getAngleFromPoints(e.targetTouches[0].pageX, e.targetTouches[0].pageY, e.targetTouches[1].pageX, e.targetTouches[1].pageY) - lastRotate[4];
					//while(alpha<NEGPI) alpha += TWOPI
					//while(alpha>=Math.PI) alpha -= TWOPI;
					if(Math.abs(alpha) >= touch_minimumAngleRotate){
						// Lock/unlock gesture
						game_altClick(x, y, lastRotate[5], (alpha>0) && true);
						lastRotate = -1;
						display_Z_slice(current_z);
						display_updateStats();
					}
				} else
					lastRotate = -1;
			} else
				lastRotate = -1;
		} else
			lastRotate = -1;
	}
	if(e.targetTouches.length != 1)
		return inelligibleTouch_Click();
}
function touch_clickHandleSingleEnd(e){
	e.preventDefault();
	
	lastRotate = -1;
	
	if(lastScrolled != -1)
		display_clickHandleZSelect(Math.max(Math.min(Math.round(current_z), size_Z-1), 0));
		//ani_moveToTargetZ(Math.max(Math.min(Math.round(current_z), size_Z-1), 0));
	
	lastScrolled = -1;
	
	if(lastTouched != -1){
		var current_z_r = Math.max(Math.min(Math.round(current_z), size_Z-1), 0);
		
		game_singleClick(lastTouched[0], lastTouched[1], current_z_r);
	
		display_Z_slice(current_z);
		display_updateStats();
	}
	
	if(e.targetTouches.length != 2){
		lastRotated = -1;
		lastScrolled = -1;
	}
}

function getAngleFromPoints(x1, y1, x2, y2){ // Return the angle (in a RH coordinate system) the point (x2, y2) is from (x1, y1)
	if(x1 == x2)
		if(y1 == y2)
			return 0;
		else if(y2>y1)
			return Math.PI/2
		else
			return -1*Math.PI/2
	else 
		return Math.atan2(y2-y1, x2-x1);
}
function ptDistSq(x1, x2, y1, y2){
	return Math.pow(x1-x2, 2) +  Math.pow(y1-y2, 2);
};