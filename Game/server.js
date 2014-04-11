var http = require("http");
var fs = require("fs");
var io = require('socket.io/index')

var httpServer = http.createServer(function(req,res)
{
    fs.readFile(__dirname + "/index.html",function(err,data)
    {    res.writeHead(200, {"Content-Type":"text/html"});
    res.write(data);
    res.end();})  

})

var serv_io = io.listen(httpServer);
serv_io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});

httpServer.listen(8080);