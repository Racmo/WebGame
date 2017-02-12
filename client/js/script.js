
var canvas = document.getElementById('game').getContext('2d');
canvas.font = '30px Arial';

var socket = io();

//get positions from server and paint them on canvas
socket.on('position', function(positions){
	canvas.clearRect(0,0,600,400);
	for(var i in positions){
		canvas.fillText('X', positions[i].x, positions[i].y);
	}
	
});

//send info about pressed keys
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