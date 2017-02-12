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
		this.speed = 3;
		this.keys = new Keys();

		this.updatePosition = function(){
			if(this.keys.upPressed) this.y-=this.speed;
			if(this.keys.leftPressed) this.x-=this.speed;
			if(this.keys.downPressed) this.y+=this.speed;
			if(this.keys.rightPressed) this.x+=this.speed;
		};
}

/////////////////////////////////////
var express = require('express'); //import module
var app = express(); //creates express aplication
var serv = require('http').Server(app);

//send /client/index.html file when GET request is made to homepage 
app.get('/', function(req, res){ 
	res.sendFile(__dirname + '/client/index.html');
});

app.use('/client', express.static(__dirname + '/client')); //access only files from client directory?

//get script.js which works on index.html
app.get('/js/script.js', function(req, res){
	console.log('send client side script');
	res.sendFile(__dirname + '/client/js/script.js');
});

app.get('/img/pusheen.png', function(req, res){
	res.sendFile(__dirname + '/client/img/pusheen.png');
});

serv.listen(2000);
/////////////////////////////////////

var connectionNumber = 0; 
var connections = []; //array with connected sockets
var players = []; //array with players

var io = require('socket.io')(serv, {}); //import module

//when someone connects to server 
io.sockets.on('connection', function(socket){
	console.log('connected');
	socket.id = connectionNumber;
	connectionNumber++;

	player = new Player(socket.id);

	players[socket.id] = player;
	connections[socket.id] = socket;

	socket.on('key pressed', function(data){
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

	//listen to disconnect event
	socket.on('disconnect',function(){
		delete connections[socket.id];
		delete players[socket.id];
	});

});

//update positions and send position data to connected players every 50ms
setInterval(function(){

	var newPositions = [];

	for(var i in players){
		players[i].updatePosition();

		newPositions.push({
			name: players[i].name,
			x: players[i].x,
			y: players[i].y
		});
	}

	for(var i in connections){
		//send data about all connected players to all connected players
		connections[i].emit('position',newPositions);
	}
}, 50);