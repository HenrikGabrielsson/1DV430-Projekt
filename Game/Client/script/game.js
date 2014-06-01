/**
 * Konstruktor för Game-objektet
 * 
 * @param   data    Innehåller seed till banan som ska skapas, och vilket spelläge. Vid multiplayer online innehåller den också ett 'rum'
 * @param   canvas  Referens till canvas-elementet
 * @param   socket  socket man ska kommunicera med servern med hjälp av
 */
function Game(data,canvas, socket)
{
    this.gameMode = data.gameMode;

    this.canvas = canvas;
    this.socket = socket;

    //en canvas till skapas och de får dela platsen vid splitscreen
    if(this.gameMode === "mp2")
    {
        //halverar storleken på canvasen
        this.canvas.width = this.canvas.width/2 - 1;
        this.canvas.style.float = "left";

        var canvasDiv = document.getElementById("canvasDiv");

        //kopierar den gamla canvasen
        this.canvas2 = document.createElement("canvas");
        this.canvas2.setAttribute("class", "gamecanvas");
        this.canvas2.width = this.canvas.width;
        this.canvas2.height = this.canvas.height;
        this.canvas2.style.float = "right";
        this.canvas2.style.backgroundImage = "url('pics/cave2.jpg')";

        canvasDiv.appendChild(this.canvas2);
    }

    //rummet vid multiplayer.
    this.room = data.room;
    
    //skapa kartan
    this.map = new Map(data, canvas);
    
     
    //alla monster sparas här     
    this.monsters = [];
}

/**
 * gameInit deklarerar flera variabler som behövs för spelet och innehåller också spelloopen.
 * 
 * @param   playerNumber    Är spelaren nummer 1 eller 2?
 */
//Startar spelet
Game.prototype.gameInit = function(playerNumber)
{

    var gameMode = this.gameMode;
       
    //meddela servern att det är redo att ta emot monster
    var socket = this.socket;
    socket.emit("gameIsOn", {gameMode:gameMode, room: this.room});
    
    //variabler som kan behövas i loopen där de inte kan nås annars    
    var canvas = this.canvas;
    var context = canvas.getContext("2d");  
    var map = this.map;
    var monsters = this.monsters;
    var frameCounter = 0; //räknar vilken frame spelet är inne på  
    var spawnMonster = this.spawnMonster;
    var renderer = this.renderer;
    var endLoop = this.endLoop;
    
    //skapa spelare och ange startposition
    var player = new Player(map , playerNumber );

    //här skapas eventuella motspelare.
    if(gameMode === "mp1")
    {
        
        //motspelaren ska vara det spelarnummer som man själv inte är...
        if(playerNumber === 1)
        {
            var thisPlayerNumber = 0;
        }
        else if(playerNumber === 0)
        {
            var thisPlayerNumber = 1;
        }
        
        var room = this.room;
        var opponent = new Player(map, thisPlayerNumber);
    }
    if(gameMode === "mp2")
    {
        //i splitscreen så är motspelaren alltid spelare 2 (1) och får sin egen canvas
        var opponent = new Player(map, 1);
        var canvas2 = this.canvas2;
        var context2 = canvas2.getContext("2d");

    }
    
    //collision detector
    var cd = new CollisionDetector(map, monsters);

    //lyssnar efter input från spelare
    var keys = listenToKeyboardInput(); //här sparas de tangenter som trycks ner med en boolean som bestämmer om de fortfarande är nertryckta

    //så här ofta ska spel-loopen köras
    var frameTime = 1000/60;

    //variabler som används för att hålla reda på vilket nummer monsterArrayen och den nya leveldatan har.
    //Annars kan datan tas emot flera gånger, och det blir problem.
    var mapPieces = 0;
    var monsterNumber = 0;
    var opponentHit = 0;

    var won; //blir true när når toppen

    //här ska alla monster sparas innan de spawnar
    var waitingMonsters = [];
    
    //Spel-loopen
    var gameLoop = setInterval(function()
    {

        //anropar funktion som utför det spelaren ber om.
        playerAction(keys, cd, 87, 65, 68, 69, player, opponent);

        //kontroller för spelare 2
        if(gameMode === "mp2")
        {
            playerAction(keys, cd, 38, 37, 39, 45,opponent, player )
        }

        //kollisioner för monster
        cd.detectMonsterWallCollision();
        cd.detectMonsterCollision(player);
        if(gameMode === "mp2"){
            cd.detectMonsterCollision(opponent);
        }

        //flytta monster
        moveMonsters(monsters, player, opponent);

        //rita bana och karaktär på nytt
        renderer(map,player,monsters, frameCounter, gameMode, opponent);

        if(gameMode === "sp") //vid sp så vinner man när man når toppen
        {
            //ta reda på vilken ruta i banans tileset som spelaren befinner sig i
            var playerRow = Math.floor(player.posY / map.tileSize);
            var playerColL = Math.floor(player.posX / map.tileSize);
            var playerColR = Math.floor((player.posX+player.width) / map.tileSize);

            won = (playerRow === 3 && (map.mapArray[playerRow+1][playerColL] > 0 || map.mapArray[playerRow+1][playerColR] > 0 ));
        }


        //med jämna mellanrum tar spelet emot mer av banan från servern.
        if(gameMode === "mp1" || gameMode === "mp2" )
        {
            socket.on("moreMap", function(data){
                if(mapPieces === data.count)
                {
                    map.addMoreMap(data.map, monsters, player, opponent);
                    mapPieces++;
                }
            })
        }

        //saker som är specifika för multiplayer online
        if(gameMode === "mp1")
        {
            //Servern meddelar att man vinner om motspelaren är död
            socket.on("youWin", function()
            {
                won = true;
            })
            
            if(frameCounter % 2 === 0)
            {
                //Skickar data om spelaren till servern så att detta kan delas med motståndaren.
                socket.emit("playerUpdate", {x:player.posX, y:player.posY, direction: player.direction, isHitting: player.hitState == 30, hitNumber: opponentHit, jumpState: player.jumpState,room: room});
            }
            
            //uppdatera motståndare
            socket.on("opponent", function(data)
            {
                opponent.posX = data.x;
                opponent.posY = data.y;
                opponent.direction = data.direction;    
                opponent.jumpState = data.jumpState;
            
                if(data.isHitting && data.hitNumber === opponentHit)
                {
                    cd.hitting(opponent, player);
                    opponentHit++;
                }  
               
            })
        }

        //nya monster spawnar
        socket.on("monsters", function(data)
        {
            if(data.monsterNumber === monsterNumber)
            {
                //lägger till de nya monstren i array där alla monster sparas.
                waitingMonsters = waitingMonsters.concat(data.monsterArray);
                monsterNumber++;
            }
        });                

        //spawnar 1 monster i sekunden när det finns monster.
        if(waitingMonsters.length > 0 && waitingMonsters[0].monsterSpawnTime === frameCounter)
        {
            spawnMonster(waitingMonsters.shift(), monsters, map, frameCounter); //det första monstret i arrayen tas bort därifrån och spawnar.
        }






        //spelloopen stängs av ifall spelaren dör
        if((gameMode === "sp" || gameMode === "mp1") && player.isDead || won)
        {
            socket.emit("gameOver");
            clearInterval(gameLoop);
            
            //om man vinner
            if(won)
            {
                endLoop(canvas, true);
            }

            //om man förlorar
            else if(player.isDead)
            {
                if(gameMode === "mp1")
                {
                    socket.emit("imDead", {room: room}); //meddela server om döden...
                }

                endLoop(canvas, false)
            }
        }

        //när nån dör i splitscreen vinner den andra spelaren
        if(gameMode === "mp2" && (player.isDead || opponent.isDead))
        {
            socket.emit("gameOver")
            clearInterval(gameLoop)

            if(player.isDead)//om spelare 1 dog
            {
                endLoop(canvas, false);
                endLoop(canvas2, true);
            }
            else if(opponent.isDead) //om spelare 2 dog
            {
                endLoop(canvas2, false);
                endLoop(canvas, true);
            }

        }


        
        frameCounter++;
    }, frameTime);

    
    
};


/**
 * När ett objekt har skapats av servern och skickats till spelet så anropas denna funktion.
 * Den tar emot data från servern och skapar sedan ett monster genom att anropa en av flera 
 * konstruktorer
 * 
 * @param   monster         innehåller data om monstret som ska skapas
 * @param   monsters        arrayen som innehåller alla monster. nya monster pushas hit
 * @param   map             kartan som används i denna game-instance
 * @param   frameCounter    räknar bilder i loopen

 */

Game.prototype.spawnMonster = function(monster, monsters, map, frameCounter)
{
    //bestämmer vilken våning som monstren ska spawnas på. För bats och trolls
    //var monsterFloor = Math.floor((playerY - (monster.monsterFloor/4) * map.tileSize) / map.tileSize);
    var monsterFloor = Math.floor(map.rows - (frameCounter / map.tileSize + monster.monsterFloor/2));

    //skapar ett nytt monster
    if(monster.monsterType === 0)
    {
        monster = new Bat(monster.monsterType, monsterFloor, monster.monsterDirection, map);
    }
    else if(monster.monsterType === 1)
    {
        monster = new Troll(monster.monsterType, monsterFloor, monster.monsterDirection, map);
    }
    else if(monster.monsterType === 2)
    {
        monster = new FallingRock(monster.monsterType, monster.monsterFloor, monster.monsterDirection, map);
    }
    monsters.push(monster); //lägger till monstret i arrayen för monster
}


/**
 * Funktion som anropar andra funktioner som ritar spelare, monster och bana
 * 
 * @param   map             banan som ska ritas
 * @param   player          spelaren som ska ritas
 * @param   monsters        array med alla monster
 * @param   frameCounter    frameräknare
 * @param   gameMode        spelläge
 * @param   opponent        spelare 2 om den finns   
 */
//funktion som anropar funktioner för att rita objekt i spelet.
Game.prototype.renderer = function(map, player, monsters, frameCounter, gameMode, opponent)
{
    //lava-bilden
    var lava = new Image(900,40);
    lava.src = "pics/lava.png";

    //canvasen börjar inte flytta banan nedåt på 2 sekunder efter att spelet startat
    var currentPos;
    if(frameCounter < 300)
    {
        currentPos = 0;
    }
    else 
    {
        currentPos = frameCounter-300;
    }

    //Canvas hämtas    
    var canvas = document.getElementsByClassName("gamecanvas")[0];
    var context = canvas.getContext("2d"); 



    //Toppen, center och vänsterkanten av canvasen. Behövs för att bestämma vad som ska renderas och var. 
    var canvasTop = (map.tileSize * map.rows) - (canvas.height+currentPos);    
    var canvasCenter = canvas.width/2;
    var canvasLeft = player.posX - (canvasCenter-player.width/2);
    
    //när canvastop når toppen så stannar bilden
    if(canvasTop <= 0)
    {
        canvasTop = 0;
    }


    //ta bort tidigare ritat på canvas
    context.clearRect(0,0,canvas.width,canvas.height);

    //rita ut spelare och eventuellt motståndare
    player.renderPlayer(context, canvasTop, canvasCenter);    

    if(gameMode === "mp1")
    {
        opponent.renderPlayer(context, canvasTop, canvasCenter, canvasLeft);   
    }
       
    
    //flytta och rita varje monster
    monsters.forEach(function(monster)
    {

        //fladdermus
        if(monster.type === 0)
        {
            monster.renderBat(context, canvasTop, canvasLeft); 
        }
        
        //troll
        else if (monster.type === 1)
        {
            monster.renderTroll(context, player, canvasTop, canvasLeft);
        }
        
        //falling rock
        else if(monster.type === 2)
        {
            monster.renderFallingRock(context, canvasTop, canvasLeft);
        }
        
    });  
    
    //karta
    map.renderMap(context, canvasTop, canvasLeft); 

    //ritar lava i botten
    lava.addEventListener("load", function()
    {
        context.drawImage(lava, 0, 0, canvas.width, lava.height, 0, canvas.height - lava.height, canvas.width, lava.height);
    },false);
  
    //kollar om spelaren dör (av brist på livslust för att dom nådde botten av fönstret)
    if(player.posY + player.height/2 > canvasTop + canvas.height)
    {
        player.isDead = true;        
    }


    //vid splitscreen måste allt också göras på canvas2
    if(gameMode === "mp2")
    {
        var canvas2 = document.getElementsByClassName("gamecanvas")[1];
        var context2 = canvas2.getContext("2d"); 

        var canvasLeft2 = opponent.posX - (canvasCenter - opponent.width/2);

        context2.clearRect(0,0,canvas2.width,canvas2.height);

        //rita motspelare i canvas 1
        opponent.renderPlayer(context, canvasTop, canvasCenter, canvasLeft); 

        //rita båda spelarna i canvas 2
        opponent.renderPlayer(context2, canvasTop, canvasCenter);
        player.renderPlayer(context2, canvasTop, canvasCenter, canvasLeft2);

        //flytta och rita varje monster
        monsters.forEach(function(monster)
        {

            //fladdermus
            if(monster.type === 0)
            {
                monster.renderBat(context2, canvasTop, canvasLeft2); 
            }
        
            //troll
            else if (monster.type === 1)
            {
                monster.renderTroll(context2, player, canvasTop, canvasLeft2);
            }
        
            //falling rock
            else if(monster.type === 2)
            {
                monster.renderFallingRock(context2, canvasTop, canvasLeft2);
            }
        });  

        //rita bana
        map.renderMap(context2, canvasTop, canvasLeft2);

        //rita lava
        lava.addEventListener("load", function()
        {
            context2.drawImage(lava, 0, 0, canvas2.width, lava.height, 0, canvas2.height - lava.height, canvas2.width, lava.height);
        },false);

        //kollar om spelaren dör (av brist på livslust för att dom nådde botten av fönstret)
        if(opponent.posY + opponent.height/2 > canvasTop + canvas2.height)
        {
            opponent.isDead = true;        
        }


    }

}





/**
 * Loop som körs för spelare som dör eller vinner. Visar ett meddelande och skickar tillbaka 
 * spelaren till huvudmenyn.
 * 
 * @param   canvas  canvas-elementet
 * @param   won     bool. True om man vinner. False om man förlorar
 */
Game.prototype.endLoop = function(canvas, won)
{

    var context = canvas.getContext("2d"); 

    //hämtar in spelare 2s canvas om den finns
    var canvas2 = document.getElementsByClassName("gamecanvas")[1];
    if(canvas2 !== undefined)
    {
        var context2 = canvas2.getContext("2d");
    }

    //om man vann så ska denna bild visas
    if(won)
    {
        var image = new Image(177,176);
        image.src ="pics/youWin.png";
    }

    //...annars denna
    else
    {
        var image = new Image(200,150);
        image.src ="pics/death.png";
    }

    var opacity = 0.01;
    //när bilden har laddats färdigt
    image.addEventListener("load", function()
    {  

        //bilden fadeas in
        var fadeInImage = setInterval(function()
        {
            
            if(opacity < 1)
            {
                context.globalAlpha = opacity;
                context.drawImage(image, 0,0, image.width, image.height, canvas.width/2 - image.width/2, canvas.height/2 - image.height/2, image.width, image.height);
                opacity = opacity + 0.01;
            }

            //full opacitet: loopen avslutas och restart visas
            else
            {
                clearInterval(fadeInImage);

                //restartknappen visas bara i spelare 1's canvas
                if(canvas !== canvas2)
                {
                    displayRestartButton();
                }
            }
            
            
        },30);
    }, false);

    //visa restart-knappen
    function displayRestartButton()
    {
        //Restart-knapp
        var button = new Image(300,60)
        button.src = "pics/button.jpg";

        //när knappens bild laddats in så visas den
        button.addEventListener("load", function()
        {
            var fontSize = 18;
            context.textAlign = "center";
            context.font = fontSize+"pt Arial";
            context.fillStyle = "#000000";

            context.drawImage(button, 0, 0, button.width, button.height, canvas.width/2 - button.width/2, canvas.height/2 - button.height/2 + 150, button.width, button.height);
            context.fillText("Back to Main Menu", canvas.width/2, canvas.height/2 + 150 + fontSize/2);

        }, false);

        canvas.addEventListener("click", restartGame, false);
        
        //gå tillbaka till huvudmeny
        function restartGame(event)
        {

            var canvasRectangle = canvas.getBoundingClientRect();

            //spara mus-koordinatoner vid klick
            var mouseX = event.clientX - canvasRectangle.left;
            var mouseY = event.clientY - canvasRectangle.top;

            //om användaren klickar på restartknappen
            if(mouseX >= canvas.width/2 - button.width/2 && mouseX <= canvas.width/2 + button.width/2 && mouseY >= canvas.height/2 - button.height/2 + 150 && mouseY <= canvas.height/2 + button.height/2 + 150)
            {
                context.clearRect(0,0, canvas.width, canvas. height);

                //tar bort canvas 2 om den finns
                if(canvas2 !== undefined)
                {
                    canvas2.parentNode.removeChild(canvas2);
                };

                canvas.removeEventListener("click", restartGame, false);

                //startfunktionen igen
                init();
            }
        }
    }



}
