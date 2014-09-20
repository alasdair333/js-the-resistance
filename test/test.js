var should = require('should');
var io = require('socket.io-client');

var socketURL = 'http://0.0.0.0:3000';

var options ={
  transports: ['websocket'],
  'force new connection': true
};

var names = ["Pete","Josh","Kevin","Graham","Chris","John","Rik","Emma","Ross","Alasdair"];


it("Should be possible to connect to the chat room", function(done)
{
	var clients = []; 
	var room = '/test';
	var password = 'test';
	var message = "hi";

	for(var i = 0; i < 10; i++)
	{
		var client = {"name":names[i], "socket":io.connect(socketURL, options)};

		client['socket'].on('chat message', function(username, msg){
	    	msg.should.equal(message);
  		});

	    client['socket'].on('updateroom', function (msg, users){
	    	users.should.not.be(null);

	    	done();
	    });


	    client['socket'].on('join failed', function(msg){

	    });

	    clients.push(client);
	}


	for(var i = 0; i < clients.length; i++)
	{
		clients[i]['socket'].emit('join room', clients[i]['name'], room, password)
	}

	

})