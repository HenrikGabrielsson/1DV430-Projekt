var static = require('node-static');
var http = require('http');
var io = require('socket.io');

var fileServer = new static.Server('./Game', {cache: 60});

var app = http.createServer(function (req, res) {
    req.addListener('end', function () {


        fileServer.serve(req, res);
    }).resume();
}).listen(8080);

var test = io.listen(app);

test.sockets.on('connection', function (socket) {
  socket.on('test', function (data) {
    console.log(data);
  });
});
