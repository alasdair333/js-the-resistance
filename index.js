var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var rooms = [];

app.get('/', function (req, res) {

	var connection = "Please connect to a chatroom: \n"+rooms;

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
				theRoom.players.push(username);	
				okToEnter = true;
			}
			else
			{
				socket.emit('join failed', 'Password incorrect');
			}
		}
		else
		{
			var newRoom = new Room(roomName, password, socket, [], new Resistance());
			newRoom.players.push(username);
			rooms.push(newRoom);
			theRoom = newRoom;
			okToEnter = true;
		}

		if(okToEnter)
		{
			socket.username = username;
			socket.room = roomName;
			socket.join(roomName);
			socket.emit('updateroom', 'You have connected to '+roomName, theRoom.players);

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

	this.state = game.state; 

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

var ResistanceGameState = ["init", "dealCharacters", "revelSpies", "teamLeader", 
							"teamBuild", "voteTeam", "mission", "missionEnd", "endGame" ];

function Resistance()
{



}