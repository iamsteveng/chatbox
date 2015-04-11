var express = require('express');
var http = require('http');
var socketio = require('socket.io');

var app = express();
var server = app.listen(8080, function(){
  console.log("Express server listening on port 8080");
});
var io = socketio.listen(server);
require('./config')(app, io);
require('./routes')(app, io);

var clients = {};
var userNames = {};
var socketList = {};


// All the server side events
io.sockets.on('connection', function(socket){
  // Practice
  socket.on('chat message', function(msg){
    console.log('message: ' + msg);
    io.emit('chat message', msg);
  });
  
  // Event: set username
  socket.on('set username', function(userName) {
    // Is this an existing user name?
    if (clients[userName] === undefined) {
      // Does not exist ... so, proceed
      clients[userName] = socket.id;
      userNames[socket.id] = userName;
      socketList[socket.id] = socket;
      userNameAvailable(socket.id, userName);
      userJoined(userName);
    } else
    if (clients[userName] === socket.id) {
      // Ignore for now
    } else {
      socketList[socket.id] = socket;
      userNameAlreadyInUse(socket.id, userName);
    }
    console.log('New user: ' + userName);
    console.log('User list on server: ' + JSON.stringify(Object.keys(clients)));
  });

  // Event: message
  socket.on('message', function(msg) {
    var srcUser;
    if (msg.inferSrcUser) {
      // Infer user name based on the socket id
      srcUser = userNames[socket.id];
    } else {
      srcUser = msg.source;
    }
    if (msg.target == "All") {
      // broadcast
      io.sockets.emit('message',
          {"source": srcUser,
           "message": msg.message,
           "target": msg.target});
    } else {
      // Look up the socket id
      socketList[clients[msg.target]].emit('message', 
          {"source": srcUser,
           "message": msg.message,
           "target": msg.target});
    }
  });

  // Event: disconnect
  socket.on('disconnect', function() {
	  var uName = userNames[socket.id];
	  delete userNames[socket.id];
    delete clients[uName];
  	// relay this message to all the clients
  	userLeft(uName);
  });
});

function userJoined(uName) {
	Object.keys(userNames).forEach(function(sId) {
		socketList[sId].emit('userJoined', { "userName": uName });
	})
}

function userLeft(uName) {
    io.sockets.emit('userLeft', { "userName": uName });
}

function userNameAvailable(sId, uName) {
  setTimeout(function() {
    console.log('Sending welcome msg to ' + uName + ' at ' + sId);
	
    socketList[sId].emit('welcome', { "userName" : uName, "currentUsers": JSON.stringify(Object.keys(clients)) });
  }, 500);
}

function userNameAlreadyInUse(sId, uName) {
  //setTimeout(function() {
    socketList[sId].emit('error', { "userNameInUse" : true });
  //}, 500);
}

/*
http.listen(3000, function(){
  console.log('listening on *:3000');
});
*/
