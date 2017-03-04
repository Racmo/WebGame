CANVAS_WIDTH = 800;
CANVAS_HEIGHT = 500;
AVATAR_WIDTH = 64;
AVATAR_HEIGHT = 64;

//class which stores information about keys status
function Keys(){
	this.upPressed = false;
	this.leftPressed = false;
	this.downPressed = false;
	this.rightPressed = false;
}

//player class
function Player(id){
	this.id = id;
	this.name = 'noName';
	this.x = 10;
	this.y = 10;
	this.speed = 4;
	this.keys = new Keys();

	this.updatePosition = function(){
		if(this.keys.upPressed) this.y-=this.speed;
		if(this.keys.leftPressed) this.x-=this.speed;
		if(this.keys.downPressed) this.y+=this.speed;
		if(this.keys.rightPressed) this.x+=this.speed;

		if(this.x + AVATAR_WIDTH> CANVAS_WIDTH) this.x = CANVAS_WIDTH - AVATAR_WIDTH;
		if(this.y + AVATAR_HEIGHT > CANVAS_HEIGHT) this.y = CANVAS_HEIGHT - AVATAR_HEIGHT;
		if(this.x < 0) this.x = 0;
		if(this.y < 0) this.y = 0;
	};
}

/////////////////////////////////////
var express = require('express'); //import module
var app = express(); //creates express application
var serv = require('http').Server(app);
var io = require('socket.io')(serv); //import module

//send /client/index.html file when GET request is made to homepage 
app.get('/', function(req, res){ 
	res.sendFile(__dirname + '/client/index.html');
});

app.use(express.static(__dirname + '/client'));


serv.listen(2000, function () {
	console.log('Listening on port 2000');
});
/////////////////////////////////////

var connectionNumber = 0; 
var connections = []; //array with connected sockets
var players = []; //array with players

//when someone connects to server
io.sockets.on('connection', function(socket){
	
	//listen to disconnect event
	socket.on('disconnect',function(){
		delete connections[socket.id];
		delete players[socket.id];
	});

	//after game is started
	socket.on('gameStarted', function(){
		console.log('gameStarted');

	socket.id = connectionNumber;
	connectionNumber++;

	player = new Player(socket.id);

	players[socket.id] = player;
	connections[socket.id] = socket;

	socket.emit('yourId', socket.id); //send back id to player

		socket.on('key pressed', function(data){
			console.log('button pushed');
			if(data.direction === 'up')
				players[socket.id].keys.upPressed = true;
			if(data.direction === 'down')
				players[socket.id].keys.downPressed = true;
			if(data.direction === 'left')
				players[socket.id].keys.leftPressed = true;
			if(data.direction === 'right')
				players[socket.id].keys.rightPressed = true;
		});
		socket.on('key released', function(data){
			console.log('button released');
			if(data.direction === 'up')
				players[socket.id].keys.upPressed = false;
			if(data.direction === 'down')
				players[socket.id].keys.downPressed = false;
			if(data.direction === 'left')
				players[socket.id].keys.leftPressed = false;
			if(data.direction === 'right')
				players[socket.id].keys.rightPressed = false;
		});

		socket.on('change name', function(data){
			console.log(data.name)
			players[socket.id].name = data.name;
		});

		socket.on("chatMessage", function (data) {
			//send message to all connected players
			console.log(data);
			for(var i in connections)
				connections[i].emit("chatMessage", data);
        });
	});

});


setInterval(function(){ 
			var newPositions = [];

			for(var i in players){
				// console.log(i);
				players[i].updatePosition();

				newPositions.push({
					id: players[i].id,
					name: players[i].name,
					x: players[i].x,
					y: players[i].y
				});
			}

			if(newPositions != null){
				for(var i in connections)
				connections[i].emit('position', newPositions);
			}
			// console.log(newPositions);
		}, 50);
