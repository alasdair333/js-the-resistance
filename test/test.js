var should = require('should');
var io = require('socket.io-client');

var socketURL = 'http://0.0.0.0:3000';

var options ={
  transports: ['websocket'],
  'force new connection': true
};

var chatUser1 = {'name':'Tom'};
var chatUser2 = {'name':'Sally'};
var chatUser3 = {'name':'Dana'};

var room = "/test";
var password = 'testPassword';


it('Should broadcast new user to all users', function(done){
  var client1 = io.connect(socketURL, options);

  client1.on('connect', function(data){
    client1.emit('join room', chatUser1.name, room, password);

    /* Since first client is connected, we connect
    the second client. */
    var client2 = io.connect(socketURL, options);

    client2.on('connect', function(data){
      client1.emit('join room', chatUser1.name, room, password);
    });

    client2.on('updateroom', function(msg, user){
      msg.should.equal("You have connected to "+room);
      client2.disconnect();
    });

  });

  /*
  var numUsers = 0;
  client1.on('updateroom', function(msg, user){
    numUsers += 1;

    if(numUsers === 2){
      usersName.should.equal(chatUser2.name + "  has connected to room");
      client1.disconnect();
      done();
    }
  });*/
});