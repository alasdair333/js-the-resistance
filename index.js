var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var rooms = [];

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


/*
	Room:
	This function create a room for a game. 
	
*/
function Room (name, password, owner, players, game)
{
	this.name = name;
	this.password = password;
	this.owner = owner;
	this.players = players;
	this.game = game; 

	this.state = game.stateName; 
}

/*
	Player:

*/
function Player(name, socket)
{
	this.name = name;
	this.socket = socket; 
}

//The resistance game:
function Resistance()
{
	this.state = 0;
	this.players = null;

	//State functions
	var init = {name: "init", func: function(game){
		
		for(var i = 0; i < game.players.length; i++)
		{
			game.players[i].socket.emit('chat message', 'TheGame', 'Lets play a game: '+game.players[i].name);
		}

		game.state++;
	}}

	var dealCharacters = {name: "dealCharacters", func: function(game){

	}}; 

	var revelSpies = {name: "revelSpies", func: function(game){

	}}; 

	var teamLeader = {name: "teamLeader", func: function(game){

	}};

	var teamBuild = {name: "teamBuild", func: function(game){

	}};

	var voteTeam = {name: "voteTeam", func: function(game){

	}}; 

	var mission = {name: "mission", func: function(game){

	}};

	var missionEnd = {name: "missionEnd", func: function(game){

	}}; 

	var endGame = {name: "endGame", func: function(game){

	}}; 

	this.ResistanceGameState = [init, dealCharacters, revelSpies, teamLeader, teamBuild,
							voteTeam, mission, missionEnd, endGame];

	this.stateName = this.ResistanceGameState[this.state].name;

	this.runState = function()
	{
		this.ResistanceGameState[this.state].func(this);
	}

	this.processEvent = function (event)
	{
		switch(event["event"])
		{
			case "start game":
				init.func(this);
			break;

			default:
				console.log("Error")
			break;
		}

	}

}