var should = require('should');
var io = require('socket.io-client');

var socketURL = 'http://0.0.0.0:3000';

var options ={
	transports: ['websocket'],
	'force new connection': true
};

var chatUser1 = {'name':'Alasdair'};
var chatUser2 = {'name':'Emma'};
var chatUser3 = {'name':'Pete'};
var chatUser4 = {'name':'Josh'};
var chatUser5 = {'name':'Rik'};
var chatUser6 = {'name':'Kevin'};
var chatUser7 = {'name':'Bob'};
var chatUser8 = {'name':'John'};
var chatUser9 = {'name':'Frank'};
var chatUser10 = {'name':'Lenny'};

var room = "/test";
var password = 'testPassword';


it('Should broadcast new user to all users', function(done){
	var client1 = io.connect(socketURL, options);

	client1.on('connect', function(data){
		client1.emit('join room', chatUser1.name, room, password);
		client1.on('updateroom', function(msg, user){
			if(user == chatUser1.name)
			{
				msg.should.equal("You have connected to /test" );
				user1Connected = true;
			}
			else
			{
				msg.should.equal(user+' has connected to room')
				user2announced = true;

				client1.disconnect();
				done();
			}
		});

		/* Since first client is connected, we connect
		the second client. */
		var client2 = io.connect(socketURL, options);
		client2.on('connect', function(data){
			client2.on('updateroom', function(msg, user){
				if(user == chatUser2.name)
				{
					msg.should.equal("You have connected to /test");
					user2connected = true;
				}
		      	client2.disconnect();
		    });
		  	client2.emit('join room', chatUser2.name, room, password);
		});
	});
});

it('Should display incorrect password', function(done){
	var client1 = io.connect(socketURL, options);

	client1.on('connect', function(data){
		client1.emit('join room', chatUser1.name, room, password);
		client1.on('updateroom', function(msg, user){
			if(user == chatUser1.name)
			{
				msg.should.equal("You have connected to /test" );
				user1Connected = true;
			}
		});

		/* Since first client is connected, we connect
		the second client. */
		var client2 = io.connect(socketURL, options);
		client2.on('connect', function(data){
			client2.on('join failed', function(msg){
				msg.should.equal('Password incorrect');
		      	client2.disconnect();
		      	client1.disconnect();
		      	done();
		    });
		  	client2.emit('join room', chatUser2.name, room, "WrongPassword");
		});
	});
});

it('Should send message to everyone', function(done){
	var client1 = io.connect(socketURL, options);

	client1.on('connect', function(data){
		client1.emit('join room', chatUser1.name, room, password);
		client1.on('chat message', function( username, msg){
			msg.should.equal("hi");

			client1.disconnect();

			done();

		});

		/* Since first client is connected, we connect
		the second client. */
		var client2 = io.connect(socketURL, options);
		client2.on('connect', function(data){
				client2.emit('join room', chatUser2.name, room, password);
		  		client2.emit('chat message', "hi");
		  		//client2.disconnect();
		});
	});	
});


