
var canvas = document.getElementById('game').getContext('2d');
canvas.font = '15px Arial';

var socket = io();
//player character img
var avatar = new Image();
avatar.src = '../img/pusheen.png';

//get positions from server and paint them on canvas
socket.on('position', function(positions){
	canvas.clearRect(0,0,800,500);
	for(var i in positions){
		canvas.fillText(positions[i].name, positions[i].x, positions[i].y+50);
		canvas.drawImage(avatar, positions[i].x, positions[i]. y, 60, 40);
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

function submitName(){
	console.log('change name');

	var name = document.getElementById('nameText').value;
	socket.emit('change name', {name: name});

	return false; //to prevent page reloading on button click
}


///////////////////////////////////////////////////////////////
window.onbeforeunload = function(){
   socket.close();
}
//for opera
window.addEventListener("beforeunload", function(e){
   socket.close();
}, false);