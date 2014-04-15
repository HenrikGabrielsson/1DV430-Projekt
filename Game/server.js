var ns = require('node-static'); //för att serva filer till klienten
var app = require('http').createServer(handler); 
var io = require('socket.io').listen(app); //socket för kommunikation med klienten

app.listen(8080); //port 8080 används på c9. 

//Game/Client är mappen där alla publika filer ligger
var fileServer = new ns.Server('./Game/Client', {cache: 10}); 

//När en klient ansluter körs denna funktion.
function handler (req, res) {
    
    req.addListener('end', function () {

        fileServer.serve(req, res); //skicka filer

    }).resume();
}
  

//här bestäms det vad som ska göras när ett meddelande skickas från en klient
io.sockets.on('connection', function(socket){
    socket.on('sendMap', function(data){
        
        //kollar det som togs emot(speltyp) och skickar sedan ett seed till klienten/klienterna.
        var seed;
        
        if(data.gameMode == 'sp') //singleplayer
        {
            seed = mapSeedMaker('sp');
        }
        else if(data.gameMode == 'mp') //multiplayer
        {
            seed = mapSeedMaker('mp');
        }
        socket.emit("map", {map: seed} );
        
    });
});


//Denna funktion skapar en array som bestämmer hur banan ska se ut (en tilemap)
function mapSeedMaker (gameMode) {
    var seed = new Array();
    
    var tileType; //här ska en framslumpad typ av tile (eller 'ruta' på en plattform) sparas
    var tileAmount; //hur många ska ligga på rad efter varandra.
    var totalAmount = 0; //antalet tiles totalt. Ska vara 418 på en bana.
    
    /*
    Tile types:
    0: tom. 
    1-5: ruta som behöver två slag för att tas bort.
    6-7: ruta som behöver ett slag för att tas bort.
    8: Ruta med en vägg under sig. Väggar går att slå sönder med två slag.
    9: Oförstörbar ruta.
    */
    
    //Antalet tiles ska vara 418. Därefter behöver inga mer läggas till.
    while(totalAmount < 418)
    {
        //ett nummber (0-9) bestämmer en tiletype. 
        tileType = Math.floor(Math.random() * 10); 
        
        //sedan väljs hur många som ska visas på raken i spelet. Detta beror på vilken typ av tile det är.
        switch(tileType)
        {
            case 0:
                tileAmount = Math.floor(Math.random() * 3 + 1); //1-3
                break;
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
                tileAmount = Math.floor(Math.random() * 6 + 2 ) //2-6
                break;
            case 6:
            case 7:
                tileAmount = Math.floor(Math.random() * 3 + 1) // 1-3
                break;
            case 8: 
                tileAmount = 1; //endast 1
                break;
            case 9:
                tileAmount = Math.floor(Math.random() * 3 + 1) // 1-3
                break;

        }
        
        seed.push(tileType);
        seed.push(tileAmount);
        
        totalAmount += tileAmount; //Antalet tiles som läggs till 
    }
    console.log(seed.length);
    return seed;
}
