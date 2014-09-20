//The resistance game:
var Resistance = function()
{
	this.state = 0;
	this.players = null;
	this.characters = []; 
	this.teamLeader = -1;

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
			case 10:jm 
				spies = 4;
				break;
		}

		for(var i = 0; i < game.players.length; i++)
		{
			if(spies > 0)
			{
				game.characters.push("Spy");
				spies--; 
			}
			else
			{
				game.characters.push("Resistance");
			}
		}

		game.characters.shuffle();
		game.state++;
	}};

	var dealCharacters = {name: "dealCharacters", func: function(game){

		//Tell everyone their roles
		for(var i = 0; i < game.players.length; i++)
		{
			game.players[i].side = game.characters[i];
			game.players[i].socket.emit('chat message', 'TheGame', 'You are: '+game.players[i].side);
		}

		game.state++;
	}}; 

	var revelSpies = {name: "revelSpies", func: function(game){
		var spies = [];
		var i = 0;

		//Notify the spies
		for( i = 0; i < game.players.length; i++)
		{
			if(game.players[i].side == "Spy" )
			{
				spies.push(game.players[i]);
			}
		}

		var msg = "Spies: ";

		//Send the list of spies to the players
		for(i = 0; i < spies.length; i++)
		{
			msg += spies[i].name+ " ";
		}

		//Send the list of spies to the players
		for(i = 0; i < spies.length; i++)
		{
			spies[i].socket.emit('chat message', 'TheGame', msg);
		}

		game.state++;
	}}; 

	var teamLeader = {name: "teamLeader", func: function(game){

		if(game.teamLeader == -1 )
		{
			game.teamLeader = Math.floor((Math.random() * game.players.length));
		}
		else
		{
			game.teamLeader++;

			if(game.teamLeader >= game.players.length)
			{
				game.teamLeader = 0; 
			}
		}

		game.players[game.teamLeader].socket.emit('chat message', 'TheGame', 'You are the leader, choose your team');

		game.state++;
	}};

	var teamBuild = {name: "teamBuild", func: function(game){

		game.state++;
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

			case "next state":
				this.ResistanceGameState[this.state].func(this);
			break;

			default:
				console.log("Error")
			break;
		}
	}
}