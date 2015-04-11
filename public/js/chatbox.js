var myUserName;
var socket = io();
// old form
$('form').submit(function(){
  //socket.emit('chat message', $('#m').val());
  var trgtUser = $('select#users').val();
  socket.emit('message', 
              {
                "inferSrcUser": true,
                "source": "",
                "message": $('#m').val(),
                "target": trgtUser
              });
  $('#m').val('');
  return false;
});
socket.on('chat message', function(msg){
  $('#messages').append($('<li>').text(msg));
});

//new form
function enableMsgInput(enable) {
  $('input#m').prop('disabled', !enable);
}

function enableUsernameField(enable) {
  $('input#userName').prop('disabled', !enable);
  $('h4#caption').hide();
}

function appendNewMessage(msg) {
/*
  var html;
  if (msg.target == "All") {
    html = "<span class='allMsg'>" + msg.source + " : " + msg.message + "</span><br/>"
  } else {
    // It is a private message to me
    html = "<span class='privMsg'>" + msg.source + " (P) : " + msg.message + "</span><br/>"
  }
  $('#msgWindow').append(html);
  
*/
  var message;
  if (msg.target == "All") {
    message = msg.source + " : " + msg.message;
  } else {
    message = msg.source + " (P) : " + msg.message;
  }
  $('#messages').append($('<li>').text(message));
}

function appendNewUser(uName, notify) {
  $('select#users').append($('<option></option>').val(uName).html(uName));
  var msg = "==>" + uName + " just joined <==";
  if (notify && (myUserName !== uName) && (myUserName !== 'All'))
    $('#messages').append($('<li>').text(msg));
    //$('span#msgWindow').append("<span class='adminMsg'>==>" + uName + " just joined <==<br/>")
}

function handleUserLeft(msg) {
	$("select#users option[value='" + msg.userName + "']").remove();
}

function setFeedback(fb) {
  $('div#feedback').html(fb);
}

function setUsername() {
	myUserName = $('input#userName').val();
    socket.emit('set username', $('input#userName').val(), function(data) { console.log('emit set username', data); });
    console.log('Set user name as ' + $('input#userName').val());
}

function sendMessage() {
    var trgtUser = $('select#users').val();
    socket.emit('message', 
                {
                  "inferSrcUser": true,
                  "source": "",
                  "message": $('input#msg').val(),
                  "target": trgtUser
                });
	$('input#msg').val("");
}

function setCurrentUsers(usersStr) {
	$('select#users >option').remove()
	appendNewUser('All', false)
	JSON.parse(usersStr).forEach(function(name) {
		appendNewUser(name, false);
	});
	$('select#users').val('All').attr('selected', true);
}

$(function() {
  enableMsgInput(false);

  socket.on('userJoined', function(msg) {
    appendNewUser(msg.userName, true);
  });
  
  socket.on('userLeft', function(msg) {
    handleUserLeft(msg);
  });

  socket.on('message', function(msg) {
    appendNewMessage(msg);
  });

  socket.on('welcome', function(msg) {
	  setFeedback("<span style='color: green'> Username available. You can begin chatting.</span>");
    setCurrentUsers(msg.currentUsers)
    enableMsgInput(true);
    enableUsernameField(false);
  });

  socket.on('error', function(msg) {
	  if (msg.userNameInUse) {
		  setFeedback("<span style='color: red'> Username already in use. Try another name.</span>");
	  }
  });
  
  $('input#userName').change(setUsername);
  $('input#userName').keypress(function(e) {
	  if (e.keyCode == 13) {
		  setUsername();
		  e.stopPropagation();
		  e.stopped = true;
		  e.preventDefault();
	  }
  });
  
  $('input#msg').keypress(function(e) {
	  if (e.keyCode == 13) {
		  sendMessage();
		  e.stopPropagation();
		  e.stopped = true;
		  e.preventDefault();
	  }
  });
});
