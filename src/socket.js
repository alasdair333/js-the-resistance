
/*
	Socket functions
*/
app.get('/', function (req, res) {
	var connection = "Please connect to a chatroom: \n";

	for(var i = 0; i < rooms.length; i++)
	{
		connection += "Room: "+rooms[i].name+" Current state: "+rooms[i].state+"\n";
	}

	res.send(connection)
});

app.get('/:room', function (req, res) {
	res.sendfile('Client/index.html');
});

app.get('/games/:file', function(req,res) {
	console.log("Getting "+req.param("file"));
	res.sendfile('games/'+req.param("file"));
});

io.on('connection', function(socket){

	socket.on('join room', function(username, roomName, password){
		var roomExists = false;
		var okToEnter = false;
		var theRoom = null;
		var newUser = new Player(username, socket);
		for(var r = 0; r < rooms.length; r++)
		{
			if(rooms[r].name == roomName)
			{
				roomExists = true;
				theRoom = rooms[r];
				break;
			}
		}

		if(roomExists)
		{
			if(theRoom.password == password)
			{
				theRoom.players.push(newUser);	
				okToEnter = true;
			}
			else
			{
				socket.emit('join failed', 'Password incorrect');
			}
		}
		else
		{
			var loaded = false;
			var theRes = new Resistance(); 
			var newRoom = new Room(roomName, password, socket, [], theRes);

			theRes.players = newRoom.players;
			newRoom.players.push(newUser);
			rooms.push(newRoom);
			theRoom = newRoom;
			okToEnter = true;
		}

		if(okToEnter)
		{
			socket.username = username;
			socket.room = roomName;
			socket.join(roomName);
			socket.emit('updateroom', 'You have connected to '+roomName);
			socket.broadcast.to(socket.room).emit('updateroom', username+' has connected to room');
		}
		else
		{
			socket.emit('join failed', 'Failed to join room');
		}		
	});

	socket.on('leave room', function(){
		socket.leave(socket.room);
	});

  	socket.on('chat message', function(msg){
    	io.to(socket.room).emit('chat message', socket.username, msg);
  	});

  	socket.on('game event', function(roomName, gameEvent){

  		for(var i = 0; i < rooms.length; i++)
  		{
  			if(rooms[i].name == roomName)
  			{
  				//rooms[i].game.players = rooms[i].players;
  				rooms[i].game.processEvent(gameEvent);
  			}
  		}
  		
  	});
});

http.listen(3000, function () {
	console.log('listening on *:3000');
});


