var players = []; //array with connected players
var myId; 

var socket = io();
socket.on('yourId', function(id){
	myId = id;
	console.log(myId);
});

//player class
function Player(id, name){
	this.id = id;
	this.name = name;

	this.sprite = game.add.sprite(0,0, 'lumber');

	console.log('New player created >>> name: '+ this.name + ' id: ' + this.id);
	players.push(this); //push player to players array

	this.updateSpritePosition = function(x, y){
		this.sprite.x = x;
		this.sprite.y = y;
	};
} 

//checks if player is on list
function playerOnList(searchedId, list){
	console.log('searchedId'+searchedId);
	for(var i in list){
		if(searchedId === list[i].id){
			console.log('index '+i);
			return i;
		}
	}
	return -1;
}

function updatePlayerPositions(newPositions){
	for(var pos in newPositions){
		console.log('newPosition id: '+newPositions[pos].id);
		var indexOfPlayer = playerOnList(newPositions[pos].id, players);
		if(indexOfPlayer >= 0){
			//player is already on the list of connected players
			players[indexOfPlayer].updateSpritePosition(newPositions[pos].x, newPositions[pos].y);
		} else {
			//create new player
			new Player(newPositions[pos].id, newPositions[pos].name);
		}
	}
}

function manageConnection(){
	socket.emit('gameStarted');
	console.log('gameStarted sent');

	socket.on('position', function(positions){
		for(var i in positions){
			updatePlayerPositions(positions);
		}
	});
}


function keyboardInput(){

	document.onkeydown = function(event){
		console.log('key pressed');
		//up
		if(event.keyCode === 38 || event.keyCode === 87) 
			socket.emit('key pressed', {direction: 'up'})
		//down
		if(event.keyCode === 40 || event.keyCode === 83)
			socket.emit('key pressed', {direction: 'down'})
		//left
		if(event.keyCode === 37 || event.keyCode === 65)
			socket.emit('key pressed', {direction: 'left'})
		//right
		if(event.keyCode === 39 || event.keyCode === 68)  
			socket.emit('key pressed', {direction: 'right'})
	}
	
//send info about key release
	document.onkeyup = function(event){
		console.log('key released');
		//up
		if(event.keyCode === 38 || event.keyCode === 87) 
			socket.emit('key released', {direction: 'up'})
		//down
		if(event.keyCode === 40 || event.keyCode === 83)
			socket.emit('key released', {direction: 'down'})
		//left
		if(event.keyCode === 37 || event.keyCode === 65)
			socket.emit('key released', {direction: 'left'})
		//right
		if(event.keyCode === 39 || event.keyCode === 68)  
			socket.emit('key released', {direction: 'right'})
	}
}

//Phaser

var game = new Phaser.Game(800, 500, Phaser.AUTO, "#game-container");
var gameState = {
	//load assets
	preload: function(){
		this.load.image('lumber', '../img/Lumber1.png');
	},
	//executed after everything is loaded
	create: function(){
		manageConnection();
		keyboardInput();
	},
	//executed multiple times per second
	update: function(){

	}
}

game.state.add('GameState', gameState);
game.state.start('GameState');