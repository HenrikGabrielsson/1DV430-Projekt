var ns = require('node-static'); //för att serva filer till klienten
var app = require('http').createServer(handler); 
var io = require('socket.io').listen(app); //socket för kommunikation med klienten

app.listen(8080); //lyssna genom denna port.


//Game/Client är mappen där alla publika filer ligger
var fileServer = new ns.Server('./Game/Client', {cache: 10}); 


/**
 * 
 * När http-requests kommer in från en klient så skickas de 
 * efterfrågade filerna från den här funktionen 
 * 
 * 
 * @param   req     det som efterfrågas.
 * @param   res     det som ska skickas tillbaka  
 * 
 */
//När en klient ansluter körs denna funktion.
function handler (req, res) {
    
    req.addListener('end', function () {
        fileServer.serve(req, res); //skicka filer

    }).resume();
}
 
/**
 * När en klient ansluter till servern så körs eventet connection.
 * Sedan lyssnar den efter att klienten frågar efter en karta som ska skickas.
 * När klienten meddelar att den är redo så börjar servern också skicka fiender.
 * 
 * Dessa genereras av servern då två klienter vid ett multiplayer-spel behöver
 * få exakt samma bana och fiender genererade till sig för att spelet ska vara 
 * i synk.
 * 
 */
//här bestäms det vad som ska göras när ett meddelande skickas från en klient
io.sockets.on('connection', function(socket){
    

    var seed;
    socket.on('sendMap', function(data){

        //kollar det som togs emot(speltyp) och skickar sedan ett seed till klienten/klienterna.
        
        
        if(data.gameMode === 'sp') //singleplayer
        {
            seed = mapSeedMaker('sp');
        }
        else if(data.gameMode === 'mp') //multiplayer
        {
            seed = mapSeedMaker('mp');
        }
        socket.emit("map", {map: seed, gameMode: data.gameMode} );

        
    });
    
    socket.on("gameIsOn", function(data)
    {
        //ger varje monster ett unikt id för att undvika dupliceringar
        var monsterNumber = 0;
        var mapPiece = 0;

        setInterval(function()
        {
            seed = mapSeedMaker("mp");
            socket.emit("moreMap", {map: seed, count: mapPiece});

            mapPiece++;

        }, 20000)

        //skickar ett monster 
        setInterval(function()
        {
            socket.emit("monster", 
            {
                monsterNumber: monsterNumber, //monsterid som ska kunna jämföras med
                monsterType: Math.floor(Math.random()*3), //Monstertyp
                monsterFloor: Math.floor(Math.random()*81), //Monstrets våning på banan
                monsterDirection: Math.floor(Math.random()*2) //Monstrets riktning(höger/vänster)
            });

            
            

            monsterNumber++;
        },1000);


    })   

});


/**
 * Funktion som skapar ett 'seed'. Detta kan sedan tolkas av 
 * en funktion på klientsidan som skapar en bana av koden som skickas härifrån
 * 
 * @param   gamemode    Typen av spel. Multiplayer och Singleplayer banor behöver olika typer.
 * @return              en array av tecken som kan bygga en bana när den tolkas av klienten
 */
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
    var seedLength;

    if(gameMode === "sp")
    {
        seedLength = 390;
    }

    if(gameMode === "mp")
    {
        seedLength = 400;
    }

    for (var i = 0; i < seedLength; i++) 
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