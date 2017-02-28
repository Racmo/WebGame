var players = []; //array with connected players
var myId; 
var nameTagStyle = {backgroundColor: "white", font: "15px Comic Sans MS", wordWrap: "false"};
var movementEnabled = true;

var socket = io();
socket.on('yourId', function(id){
	myId = id;
	console.log(myId);
});

//speech balloon class
function SpeechBaloon() {

    this.style = {backgroundColor: "white", font: "15px Comic Sans MS", wordWrap: "true", wordWrapWidth: 200};
    this.textRect =  game.add.text(10, 10, '', this.style);

    this.moveBalloon = function(x,y){
        console.log('move balloon');
        this.textRect.x = x;
        this.textRect.y = y - this.textRect.height;
    }

    var speechBaloon = this;

    this.delete = function () {
        speechBaloon.textRect.visible = false;
    }

    this.timer = setTimeout(this.delete, 3000);

    this.changeText = function (text) {
        this.textRect.visible = true;
        console.log('set visible');
        clearTimeout(this.timer);

        this.textRect.setText(text);

        this.timer = setTimeout(this.delete, 3000);
    }
}

//player class
function Player(id, name){
	this.id = id;
	this.name = name;

	this.sprite = game.add.sprite(0,0, 'lumber'); //player avatar
	this.nameTag = game.add.text(0, 0, this.name, nameTagStyle); //player name tag
	this.speechBalloon = new SpeechBaloon();

	// console.log('New player created >>> name: '+ this.name + ' id: ' + this.id);
	players.push(this); //push player to players array

	this.updateSpritePosition = function(x, y){
		this.sprite.x = x;
		this.sprite.y = y;

		this.nameTag.x = this.sprite.x;
		this.nameTag.y = this.sprite.y + this.sprite.height;

        this.speechBalloon.moveBalloon(this.sprite.x, this.sprite.y);
	};

	this.say = function (text) {
        this.speechBalloon.changeText(text);
    };

	this.delete = function(){
		this.sprite.destroy();
		this.nameTag.destroy();
	};
} 

//checks if player is on list
function playerOnList(searchedId, list){
	//console.log('searchedId'+searchedId);
	for(var i in list){
		if(searchedId === list[i].id){
			//console.log('index '+i);
			return i;
		}
	}
	return -1;
}

function updatePlayerPositions(newPositions){
	for(var pos in newPositions){
		//console.log('newPosition id: '+newPositions[pos].id);
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

function deleteDisconnectedPlayers(newPositions){
	for(var i in players){
		var indexOfPlayer = playerOnList(players[i].id, newPositions);
		if (indexOfPlayer < 0){
			console.log('destroy player');
			players[i].delete();
			delete players[i]; //TODO
		} 
	}
}

function manageConnection(){
	socket.emit('gameStarted');
	console.log('gameStarted sent');

	socket.on('position', function(positions){
		for(var i in positions){
			updatePlayerPositions(positions);
			deleteDisconnectedPlayers(positions);
		}
	});
}


function keyboardInput(){

	document.onkeydown = function(event){
		if(movementEnabled){
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

function manageChat() {
    //send chat message to server
    $("#chatForm").submit(function (e) {
        e.preventDefault(); //no page reload after submit

        var message = $("#chatInput").val();
        socket.emit("chatMessage", {id: myId, message: message});
    });
    //receive chat message from server
    socket.on("chatMessage", function (data) {
       console.log(data);

       var index = playerOnList(data.id, players);
       if( index >=0 ){
           players[index].say(data.message);
        }
    });
}


//Phaser

var game = new Phaser.Game(800, 500, Phaser.AUTO, "gameWindow");
var gameState = {
	//load assets
	preload: function(){
		this.load.image('lumber', '../img/Lumber1.png');
	},
	//executed after everything is loaded
	create: function(){
		manageConnection();
		keyboardInput();
		manageChat();
	},
	//executed multiple times per second
	update: function(){

	}
}

game.state.add('GameState', gameState);
game.state.start('GameState');


//disable movement when player is typing in chat
$("#chatInput").focus(function () {
	//player is typing in chat
    console.log("focus");
    this.value = "";
	movementEnabled = false;
})
	.focusout(function () {
	//player stopped typing in chat
        console.log("unfocus");
	    movementEnabled = true;
    });


