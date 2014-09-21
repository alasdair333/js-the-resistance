Array.prototype.shuffle = function() {
    var i = this.length, j, temp;
    if (i == 0) return this;
    while (--i) {
        j = Math.floor(Math.random() * (i + 1));
        temp = this[i];
        this[i] = this[j];
        this[j] = temp;
    }
    return this;
};

var Resistance = function() {
    this.state = 0;
    this.players = null;
    this.characters = [];
    this.teamLeader = -1;
    var init = {
        name: "init",
        func: function(game) {
            var spies = 0;
            for (var i = 0; i < game.players.length; i++) {
                game.players[i].socket.emit("chat message", "TheGame", "Lets play a game: " + game.players[i].name);
            }
            switch (game.players.length) {
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
                jm;
                spies = 4;
                break;
            }
            for (var i = 0; i < game.players.length; i++) {
                if (spies > 0) {
                    game.characters.push("Spy");
                    spies--;
                } else {
                    game.characters.push("Resistance");
                }
            }
            game.characters.shuffle();
            game.state++;
        }
    };
    var dealCharacters = {
        name: "dealCharacters",
        func: function(game) {
            for (var i = 0; i < game.players.length; i++) {
                game.players[i].side = game.characters[i];
                game.players[i].socket.emit("chat message", "TheGame", "You are: " + game.players[i].side);
            }
            game.state++;
        }
    };
    var revelSpies = {
        name: "revelSpies",
        func: function(game) {
            var spies = [];
            var i = 0;
            for (i = 0; i < game.players.length; i++) {
                if (game.players[i].side == "Spy") {
                    spies.push(game.players[i]);
                }
            }
            var msg = "Spies: ";
            for (i = 0; i < spies.length; i++) {
                msg += spies[i].name + " ";
            }
            for (i = 0; i < spies.length; i++) {
                spies[i].socket.emit("chat message", "TheGame", msg);
            }
            game.state++;
        }
    };
    var teamLeader = {
        name: "teamLeader",
        func: function(game) {
            if (game.teamLeader == -1) {
                game.teamLeader = Math.floor(Math.random() * game.players.length);
            } else {
                game.teamLeader++;
                if (game.teamLeader >= game.players.length) {
                    game.teamLeader = 0;
                }
            }
            game.players[game.teamLeader].socket.emit("chat message", "TheGame", "You are the leader, choose your team");
            game.state++;
        }
    };
    var teamBuild = {
        name: "teamBuild",
        func: function(game) {
            game.state++;
        }
    };
    var voteTeam = {
        name: "voteTeam",
        func: function(game) {}
    };
    var mission = {
        name: "mission",
        func: function(game) {}
    };
    var missionEnd = {
        name: "missionEnd",
        func: function(game) {}
    };
    var endGame = {
        name: "endGame",
        func: function(game) {}
    };
    this.ResistanceGameState = [ init, dealCharacters, revelSpies, teamLeader, teamBuild, voteTeam, mission, missionEnd, endGame ];
    this.stateName = this.ResistanceGameState[this.state].name;
    this.processEvent = function(event) {
        switch (event["event"]) {
          case "start game":
            init.func(this);
            break;

          case "next state":
            this.ResistanceGameState[this.state].func(this);
            break;

          default:
            console.log("Error");
            break;
        }
    };
};

var app = require("express")();

var http = require("http").Server(app);

var io = require("socket.io")(http);

var rooms = [];

function Player(name, socket) {
    this.name = name;
    this.socket = socket;
}

function Room(name, password, owner, players, game) {
    this.name = name;
    this.password = password;
    this.owner = owner;
    this.players = players;
    this.game = game;
    this.state = game.stateName;
}

app.get("/", function(req, res) {
    var connection = "Please connect to a chatroom: \n";
    for (var i = 0; i < rooms.length; i++) {
        connection += "Room: " + rooms[i].name + " Current state: " + rooms[i].state + "\n";
    }
    res.send(connection);
});

app.get("/:room", function(req, res) {
    res.sendfile("Client/index.html");
});

io.on("connection", function(socket) {
    socket.on("join room", function(username, roomName, password) {
        var roomExists = false;
        var okToEnter = false;
        var theRoom = null;
        var newUser = new Player(username, socket);
        for (var r = 0; r < rooms.length; r++) {
            if (rooms[r].name == roomName) {
                roomExists = true;
                theRoom = rooms[r];
                break;
            }
        }
        if (roomExists) {
            if (theRoom.password == password) {
                theRoom.players.push(newUser);
                okToEnter = true;
            } else {
                socket.emit("join failed", "Password incorrect");
            }
        } else {
            var loaded = false;
            var theRes = new Resistance();
            var newRoom = new Room(roomName, password, socket, [], theRes);
            theRes.players = newRoom.players;
            newRoom.players.push(newUser);
            rooms.push(newRoom);
            theRoom = newRoom;
            okToEnter = true;
        }
        if (okToEnter) {
            socket.username = username;
            socket.room = roomName;
            socket.join(roomName);
            socket.emit("updateroom", "You have connected to " + roomName, username);
            socket.broadcast.to(socket.room).emit("updateroom", username + " has connected to room", username);
        } else {
            socket.emit("join failed", "Failed to join room");
        }
    });
    socket.on("leave room", function() {
        socket.leave(socket.room);
    });
    socket.on("chat message", function(msg) {
        io.to(socket.room).emit("chat message", socket.username, msg);
    });
    socket.on("game event", function(roomName, gameEvent) {
        for (var i = 0; i < rooms.length; i++) {
            if (rooms[i].name == roomName) {
                rooms[i].game.processEvent(gameEvent);
            }
        }
    });
});

http.listen(3e3, function() {
    console.log("listening on *:3000");
});