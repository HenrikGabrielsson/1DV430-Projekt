var http = require("http");
var fs = require("fs");

var httpServer = http.createServer(handler);

function handler(req,response)
{
    fs.readFile("index.html", function(err,data){
        response.writeHead(200, {"Content-Type":"text/html"});
        //response.write("hellloooo");
        response.end();        
    })

}
httpServer.listen(8080);