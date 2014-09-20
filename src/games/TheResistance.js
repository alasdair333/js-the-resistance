//The resistance game:
var Resistance = function()
{
	this.state = 0;
	this.players = null;
	this.characters = []; 

	//State functions
	var init = {name: "init", func: function(game){
		var spies = 0;
		
		for(var i = 0; i < game.players.length; i++)
		{
			game.players[i].socket.emit('chat message', 'TheGame', 'Lets play a game: '+game.players[i].name);
		}

		switch(game.players.length)
		{
			case 5:
			case 6:
				spies = 2;
				break;
			case 7:
			case 8:
			case 9:
				spies = 3;
				break;
			case 10:
				spies = 4;
				break;
		}

		for(var i = 0; i < game.players.length; i++)
		{
			if(spies > 0)
			{
				game.characters.push("spy");
				spies--; 
			}
			else
			{
				game.characters.push("Resistance");
			}
		}

		game.characters.shuffle()

		for(var i = 0; i < game.players.length; i++)
		{
			
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