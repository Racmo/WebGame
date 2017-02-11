var express = require('express'); //import module
var app = express(); //creates express aplication
var serv = require('http').Server(app);

//send /client/index.html file when GET request is made to homepage 
app.get('/', function(req, res){ 
	res.sendFile(__dirname + '/client/index.html');
});

app.use('/client', express.static(__dirname + '/client')); //access only files from client directory?

app.get('/js/script.js', function(req, res){
	console.log('zapytanie o skrypt');
	res.sendFile(__dirname + '/client/js/script.js');
});


serv.listen(2000);