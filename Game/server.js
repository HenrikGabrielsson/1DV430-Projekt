var ns = require('node-static'); //för att serva filer till klienten
var app = require('http').createServer(handler); 
var io = require('socket.io').listen(app); //socket för kommunikation med klienten

app.listen(process.env.PORT); //lyssna genom denna port.


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

//array som sparar spelare som vill spela mp.
var mpPlayers = [];

 
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
    
    //ska användas för att samma bana och samma slag bara får tas emot en gång på klienten
    var gameNumber = 0;
    var hitNumber = 0;

    //en connection har valt ett spelläge och meddelar detta.
    socket.on('startGame', function(data){

        if(data.gameMode === 'sp' || data.gameMode === "mp2") //singleplayer
        {
            var seed = mapSeedMaker(data.gameMode);
            socket.emit("map", {map: seed, gameMode: data.gameMode, playerNumber: 0, gameNumber: gameNumber} );

            gameNumber++;
        }
        
        else if(data.gameMode === 'mp1') //multiplayer
        {
            gameNumber = 0; //återställer game number för att två klienter måste få samma nummer.

            mpPlayers.push(socket); //sparar spelaren i en socket.
            
            socket.on("disconnect", function()
            {
                mpPlayers.splice(mpPlayers.indexOf(socket),1);
            });

            //om det finns mer än 1 spelare som vill spela mp
            //så plockas de två första ut ur arrayen(first in, first out) 
            //och läggs i ett eget 'room'. De får samma bana skickade till sig men varsitt "spelarnummer"
            if(mpPlayers.length > 1)
            {
                var roomName = Date.now(); //använder Date.now för att skapa ett 'unikt' namn för rummet.

                var seed = mapSeedMaker(data.gameMode);

                //skickar till spelare 1
                var player = mpPlayers.shift();
                player.join(roomName);
                player.emit("map", {map: seed, gameMode: data.gameMode, room:roomName, playerNumber: 0, gameNumber: gameNumber});
                
                //skickar till spelare 2
                player = mpPlayers.shift();
                player.join(roomName);
                player.emit("map", {map: seed, gameMode: data.gameMode, room:roomName, playerNumber: 1, gameNumber: gameNumber});

                gameNumber++;
     
            }
        }

    });


    //skickar data till motståndare så att den kan uppdateras även där.
    socket.on("playerUpdate", function(data)
    {
        //data.x = x-position
        //data.y = y-position
        //data.direction = hållet spelaren kollar åt
        //data.isHitting = bool. Slår spelaren?
        //data.jumpState = spelarens jumpstate
        //data.room = vilket spelrum spelaren är i
        
        
        
        //skicka data till motståndare
        socket.broadcast.to(data.room).emit("opponent", {x:data.x, y: data.y, direction: data.direction, isHitting: data.isHitting, hitNumber:hitNumber, jumpState: data.jumpState});
        
        if(data.isHitting)
        {
            hitNumber++;
        }
        
    })
    
    //En spelare har dött. motspelaren meddelas om att den har vunnit
    socket.on("imDead", function(data)
    {
        socket.broadcast.to(data.room).emit("youWin");     
    })

    //man vinner om motspelaren lämnar rummet 
    socket.on("disconnect", function()
    {
        var room = io.sockets.manager.roomClients[socket.id]; //ta reda på vilket rum spelaren är i.
        socket.broadcast.to(room[0]).emit("youWin"); //skicka "youwin" till spelaren som är kvar i rummet.
        
        socket.leave(room[0]);

    });

    socket.on("gameIsOn", function(data)
    {
        //ger varje monster ett unikt id för att undvika dupliceringar
        var monsterNumber = 0;
        var mapPiece = 0;

        //vid mp skickas mer av banan kontinuerligt
        if(data.gameMode === "mp1" || data.gameMode ==="mp2")
        {
            var mapInterval= setInterval( moreMap, 20000) // 20s
        }

        

        //skickar nya monster var 4:e sekund
        var monsterInterval = setInterval(sendMonsters,4000);

        socket.on("gameOver", function()
        {


            clearInterval(monsterInterval);
            clearInterval(mapInterval);
        });

        function moreMap()
        {
            var seed = mapSeedMaker("mp1");
            io.sockets.in(data.room).emit("moreMap", {map: seed, count: mapPiece});
            mapPiece++;
        };


        var spawnTime = 600; //första monstret kommer efter 10 sekunder
        function sendMonsters()
        {
            var monsterArray = [];

            //skapa array med monster(json-objekt);
            for(var i = 0; i < 10; i++)
            {
                monsterArray.push
                ({
                    monsterType: Math.floor(Math.random()*3), //Monstertyp
                    monsterFloor: Math.floor(Math.random()*41), //Monstrets våning på banan
                    monsterDirection: Math.floor(Math.random()*2), //Monstrets riktning(höger/vänster)
                    monsterSpawnTime: spawnTime //när monstret ska spawna.
                })
                spawnTime += 30;
            }

            if(data.gameMode === "sp" || data.gameMode ===  "mp2")
            {
                socket.emit("monsters", {monsterArray: monsterArray, monsterNumber: monsterNumber});
            }
            else if(data.gameMode === "mp1")
            {
                io.sockets.in(data.room).emit("monsters", {monsterArray: monsterArray, monsterNumber: monsterNumber});
            }

            monsterNumber++;
            
        }    
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

    if(gameMode === "mp1" || gameMode === "mp2")
    {
        seedLength = 400;
    }

    for (var i = 0; i < seedLength; i++) 
    {
        //ett nummber (0-9) bestämmer en tiletype. 
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

    return seed;
    
}