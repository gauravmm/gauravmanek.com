// Options
var size_X = 5;
var size_Y = 5;
var size_Z = 5;

var numMinesTotal = 4;

var floodfillSearch = new Array(new Array(-1, 0, 0), new Array(1, 0, 0), new Array(0, -1, 0), new Array(0, 1, 0), new Array(0, 0, -1), new Array(0, 0, 1)); 

// Variable Declaration
var gameBoard; 							// Stored as gameBoard[Z][Y][X];
										// 1 -> is a mine; 2 -> is revealed; 4 -> is flagged;
var gameBoardNumbers; 					// Stored as gameBoardNumbers[Z][Y][X];
										// value -> Number of neighbouring mines;
										
var current_z;
var flagCount;
var clearCount;
var freezeStats;
var startTime;
var totalVolume;

// Main functions
function gameStart(){
	game_initialize();
	display_initialize();
}

// Support functions
/*
function game_board_xyz_to_number(x, y, z){
	var retval = x;
	retval += size_X * y;
	retval += size_Y * z;
	
	return retval;
}

function game_board_number_to_xyz(number){
	var x, y, z;
	
	x = number % size_X;
	number = Math.floor(number / size_X);
	
	y = number % size_Y;
	number = Math.floor(number / size_Y);
	
	z = number % size_Z;
	
	return array(z, y, x);
}
*/
function b(n, nx){
	if(n < 0 || n >= nx)
		return false;
	return true;
}
function game_incrementMineCount(x, y, z){
	for(i = -1; i <= 1; ++i)
		for(j = -1; j <= 1; ++j)
			for(k = -1; k <= 1; ++k)
				if(i != 0 || j != 0 || k != 0)
					if(b(z+k, size_Z) && b(y+j, size_Y) && b(x+i, size_X))
						++gameBoardNumbers[z+k][y+j][x+i];
}

// Main game functions
function game_initialize(){
	gameBoard = new Array(size_Z);
	gameBoardNumbers = new Array(size_Z);

	for(var k = 0; k < size_Z; ++k){
		gameBoard[k] = new Array(size_Y);
		gameBoardNumbers[k] = new Array(size_Y);
		
		for(var j = 0; j < size_Y; ++j){
			gameBoard[k][j] = new Array(size_X);
			gameBoardNumbers[k][j] = new Array(size_X);
			
			for(var i = 0; i < size_X; ++i){
				gameBoard[k][j][i] = 0;
				gameBoardNumbers[k][j][i] = 0;
			}
		}
	}
	
	if(numMinesTotal > size_X * size_Y * size_Z){
		alert("Too many mines!");
		return false;
	}
	
	
	// Populate with mines
	var numMines = 0;
	while (numMines < numMinesTotal){
		x = Math.floor(Math.random() * size_X);
		y = Math.floor(Math.random() * size_Y);
		z = Math.floor(Math.random() * size_Z);
		
		if((gameBoard[z][y][x] & 1) == 0){
			gameBoard[z][y][x] = gameBoard[z][y][x] | 1;
			++numMines;
			game_incrementMineCount(x, y, z);
		}
	}

	current_z = 0;
	flagCount = 0;
	clearCount = 0;
	totalVolume = size_X*size_Y*size_Z;
	
	startTime = (new Date()).getTime();
	freezeStats = false;
}
function game_floodfillReveal(x, y, z){ // Sequential version of the floodfill algo. Because firefox limits stack size
	if(gameBoard[z][y][x] & 2)
		return; // If it is already revealed, stop.

	var queue = new Array();
	queue.unshift(new Array(x, y, z));
	
	while(queue.length > 0){
		var a = queue.pop();
		
		if(gameBoard[a[2]][a[1]][a[0]] & 2)
			continue; // If it is already revealed, skip.
		
		gameBoard[a[2]][a[1]][a[0]] = 2; // Must be revealed, not flagged and cannot be a mine. Its status is therefore 0+2+0 = 2
		++clearCount;

		if(gameBoardNumbers[a[2]][a[1]][a[0]] == 0) // If the current number is not zero, then we are at the border, and should stop here. Else, populate the queue with neighbours
			for(i = 0; i < floodfillSearch.length; ++i)
				if(b(a[2]+floodfillSearch[i][2], size_Z) && b(a[1]+floodfillSearch[i][1], size_Y) && b(a[0]+floodfillSearch[i][0], size_X))
					queue.unshift(new Array(a[0]+floodfillSearch[i][0], a[1]+floodfillSearch[i][1], a[2]+floodfillSearch[i][2]));
	}
}
/*
function game_floodfillReveal_recursive(x, y, z){
	if(gameBoard[z][y][x] & 2)
		return; // If it is already revealed, stop.
	
	gameBoard[z][y][x] = 2; // Must be revealed, not flagged and cannot be a mine. Its status is therefore 0+2+0 = 2
	
	if(gameBoardNumbers[z][y][x] == 0) // If the current number is not zero, then we are at the border, and should stop here.
		for(i = -1; i <= 1; ++i)
			for(j = -1; j <= 1; ++j)
				for(k = -1; k <= 1; ++k)
					if(i != 0 || j != 0 || k != 0)
						if(b(z+k, size_Z) && b(y+j, size_Y) && b(x+i, size_X))
							game_floodfillReveal_recursive(x+i, y+j, z+k);
}
*/

function game_singleClick(x, y, z){
	if(freezeStats)
		return;

	if((gameBoard[z][y][x] & 4) == 4)
		return;
	
	if((gameBoard[z][y][x] & 1) == 1){
		game_handleFailure();
		return;
	}
	
	if((gameBoard[z][y][x] & 2) == 0)
		game_floodfillReveal(x, y, current_z);
	
	if(clearCount + numMinesTotal == totalVolume)
		game_handleVictory();
}
function game_altClick(x, y, z){
	if(freezeStats)
		return;
	
	if((gameBoard[current_z][y][x] & 2) == 2)
		return; // No action taken
	
	if((gameBoard[current_z][y][x] & 4) == 4)
		--flagCount;
	else
		++flagCount;
	
	gameBoard[current_z][y][x] = gameBoard[current_z][y][x] ^ 4;
}
function game_handleVictory(){
	freezeStats = true;
	display_victory();
}
function game_handleFailure(){
	freezeStats = true;
	display_failure();
}