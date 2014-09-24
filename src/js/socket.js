
/*
	Socket functions
*/

/*
	Return a list of all active rooms
*/
app.get('/', function (req, res) {
	var connection = "Please connect to a chatroom: \n";

	for(var i = 0; i < rooms.length; i++)
	{
		connection += "Room: "+rooms[i].name+" Current state: "+rooms[i].state+"\n";
	}

	res.send(connection)
});

/*
	Return the HTML file for the chatroom
*/
app.get('/:room', function (req, res) {
	res.sendfile('Client/index.html');
});

/*
	Socket Connection function
*/
io.on('connection', function(socket){

	/*
		Process a join room socket event
		If the room doesn't exist 
		create a new one otherwise join the room
	*/
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
			socket.emit('updateroom', 'You have connected to '+roomName, username);
			socket.broadcast.to(socket.room).emit('updateroom', username+' has connected to room', username);
		}
		else
		{
			socket.emit('join failed', 'Failed to join room');
		}		
	});

	/*
		Shutdown server
	*/
	socket.on('shutdown server', function(pass)
	{
		console.log("Shutting down server recv");
		if(pass == 'adminPassword')
		{
			gracefulShutdown(socket);
		}
	});

	/*
		Close the connection to the room
	*/
	socket.on('leave room', function(){
		socket.leave(socket.room);
	});

	/*
		Process a chat message event
	*/
  	socket.on('chat message', function(msg){
    	io.to(socket.room).emit('chat message', socket.username, msg);
  	});

  	/*
		Process a game event
  	*/
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


/*
	Listen on a connection
*/
http.listen(3000, function () {
	console.log('listening on *:3000');
});

// listen for TERM signal .e.g. kill 
process.on ('SIGTERM', gracefulShutdown);

// listen for INT signal e.g. Ctrl-C
process.on ('SIGINT', gracefulShutdown); 

function gracefulShutdown(){

	io.close(function()
	{
		console.log("Closed Remaining Connections");
		process.exit(0);
	});		

	// if after 
	setTimeout(function() 
	{
    	console.error("Could not close connections in time, forcefully shutting down");
       	process.exit()
  	}, 10*1000);		
}


