var express = require('express')
  , app = express()
  , http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server);

// Public files
app.use(express.static(__dirname + '/public'));

server.listen(3000);

// routing
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

// usernames which are currently connected to the chat
//var usernames = {};

io.sockets.on('connection', function (socket) {

  // when the client emits 'update', this listens and executes
  socket.on('update', function (data) {
    // we tell the client to execute 'updatechat' with 2 parameters
    //io.sockets.emit('updatechat', socket.username, data);
    motor_move(data);
    //console.log(data);
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function(){
  });
  
});



var five = require('johnny-five'),
          board, motor, led;

board = new five.Board();
var motor_pins = {'left': [3, 2], 'right': [8, 7]}; // {forward, backward}
var motors = {'left': new Array(), 'right': new Array()};

board.on("ready", function() {
  // Add LED
  led = new five.Led({
    pin: 13
  });

  // Add motors
  for (var side in motor_pins) {
    for (var i = 0; i < motor_pins[side].length; i++) {
      motors[side][i] = new five.Motor({
        pin: motor_pins[side][i]
      });
      board.repl.inject({
        motor: motors[side][i]
      });

      motors[side][i].on("start", function( err, timestamp ) {
        console.log( "start", timestamp );
        led.on();
      });

      // "stop" events fire when the motor is started.
       motors[side][i].on("stop", function( err, timestamp ) {
        console.log( "stop", timestamp );
        led.off();
      });


    }
  }

});

function motor_move(d){
  console.log(d);
  // Stop
  if (d.dy == 0 && d.dx == 0) {
    motors.left[0].stop();
    motors.left[1].stop();
    motors.right[0].stop();
    motors.right[1].stop();
  }
  // Forward or backwards
  else if (Math.abs(d.dy) > Math.abs(d.dx)) {
    if (d.dy > 0) {
      motors.left[0].start();
      motors.right[0].start();
      motors.left[1].stop();
      motors.right[1].stop();
    }
    else {
      motors.left[1].start();
      motors.right[1].start();
      motors.left[0].stop();
      motors.right[0].stop();
    }
  }
  // Left or right
  else {
    if (d.dx > 0) {
      // Right
      motors.left[0].start();
      motors.right[1].start();
      motors.left[1].stop();
      motors.right[0].stop();
    }
    else {
      // Left
      motors.left[1].start();
      motors.right[0].start();
      motors.left[0].stop();
      motors.right[1].stop();
    }
  }
}
