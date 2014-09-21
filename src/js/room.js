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