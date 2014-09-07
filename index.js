var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var rooms = [];

app.get('/', function (req, res) {

	var connection = "Please connect to a chatroom: \n"+rooms;

	console.log(rooms);
	res.send(connection)
});

app.get('/:room', function (req, res) {
	res.sendfile('Client/index.html');
});


io.on('connection', function(socket){

	socket.on('join room', function(username, room){
		socket.username = username;
		socket.room = room;
		socket.join(room);
		socket.emit('updateroom', 'You have connected to '+room);
		socket.broadcast.to(room).emit('updateroom', username+' has connected to room');
	});

	socket.on('leave room', function(){
		socket.leave(socket.room);
	});

  	socket.on('chat message', function(msg){
    	io.to(socket.room).emit('chat message', socket.username, msg);
  	});
});


http.listen(3000, function () {
	console.log('listening on *:3000');
});