var ns = require('node-static'); //för att serva filer till klienten
var app = require('http').createServer(handler); 
var io = require('socket.io').listen(app); //socket för kommunikation med klienten

app.listen(8080); //port 8080 används på c9. 

//Game/Client är mappen där alla publika filer ligger
var fileServer = new ns.Server('./Game/Client', {cache: 1}); 

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
    var seed = [];
    
    var tileType; //här ska en framslumpad typ av tile (eller 'ruta' på en plattform) sparas
    var amount;
    
    /*
    Tile types:
    0: tom. 
    1-5: ruta som behöver två slag för att tas bort.
    6-7: ruta som behöver ett slag för att tas bort.
    8: Ruta med en vägg under sig. Väggar går att slå sönder med två slag.
    9: Oförstörbar ruta.
    */

    for (var i = 0; i < 391; i++) //391 = 7+9+11+13...37+39
    {
        //ett nummber (0-9) bestämmer en tiletype. 
        if(i != 356)
        {
            tileType = Math.floor(Math.random() * 10); 
            
            while(tileType === 8 && seed[i-1] == 8) //aldrig mer än en vägg efter varandra
            {
                tileType = Math.floor(Math.random() * 10); 
            }
            seed[i] = tileType;
            
            if(tileType >= 1 && tileType <= 5) //En vanlig tvåslagsruta skapas i kluster om 1-3;
            {
                amount = Math.floor(Math.random() * 3 + 1); 
            }
            
            else if(tileType >= 6 && tileType <= 7 || tileType === 9)//Enslagsrutor och oslagbara kommer ofta i par.
            {
                amount = Math.floor(Math.random() * 2 + 1); 
            }
            else //Tomma rutor och väggar = 1 gång
            {
                amount = 1;
            }
                    
    
            //lägg till alla block i seedet.
            for (var j = 1; j < amount; j++)
            {
                i++;
                seed[i] = tileType;
            }
                
            
        }
        else
        {
            seed[i] = tileType = 9; //Alltid en oförstörbara ruta ovanför startplatsen (för att undvika en vägg igenom spelaren)
        }
    }        

    return seed;
}

