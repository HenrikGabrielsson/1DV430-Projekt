/**
 * Konstruktor för Game-objektet
 * 
 * @param   data    Innehåller seed till banan som ska skapas
 * @param   canvas  Referens till canvas-elementet
 * @param   context Canvas-elementets context(2d);
 */
function Game(data,canvas,context)
{
    this.data = data;
    this.canvas = canvas;
    this.context = context;
    this.socket = io.connect();
    
    this.map = new Map(this.data.map, canvas);
    
    //alla monster sparas här     
    this.monsters = [];
}

/**
 * gameInit deklarerar flera variabler som behövs för spelet och innehåller också spelloopen.
 * 
 */
//Startar spelet
Game.prototype.gameInit = function()
{
    
    var socket = this.socket;
    
    socket.emit("gameIsOn");
    
    var canvas = this.canvas;
    var context = this.context;
    
    var map = this.map;
    var monsters = this.monsters;
    
    
    var spawnMonster = this.spawnMonster;
    var renderer = this.renderer;
    var deathLoop = this.deathLoop;
    var winLoop = this.winLoop;
    
    //skapa spelare och ange startposition
    var player = new Player(map.tileSize * 5,(map.rows-2) * map.tileSize);
    
    var cd = new CollisionDetector(map, player, monsters);
    
    //lyssnar efter input från spelare
    var keys = []; //här sparas de tangenter som trycks ner med en boolean som bestämmer om de fortfarande är nertryckta
    
    //så här många pixlar/frameTime springer spelare.

    //trycker på tangent
    document.addEventListener('keydown', function(event) {

        keys[event.keyCode] = true;
    });
    
    //släpper tangent
    document.addEventListener('keyup', function(event) {
        keys[event.keyCode] = false;
    });
    
    //så här ofta ska spel-loopen köras
    var frameTime = 1000/60;
    
    
    //Spel-loopen
    var gameLoop = setInterval(function()
    {
           
        //ta reda på vilken ruta i banans tileset som spelaren befinner sig i
        var playerRow = Math.floor(player.posY / map.tileSize);
        var playerColL = Math.floor(player.posX / map.tileSize);
        var playerColR = Math.floor((player.posX+player.side) / map.tileSize);
        
        
        //Styrning av karaktär och slag
        
        //hopp
        //W och står på en plattform
        if(keys[87] && (map.mapArray[playerRow+1][playerColL] > 0 || map.mapArray[playerRow+1][playerColR] > 0 ) && player.jumpState === 0 )
        {
            player.direction = 2;
            
            player.ySpeed = 0; //återställer
            player.jumpState = player.side * 0.9; 
            player.ySpeed -= player.jumpState;
            player.jumpState--;
        }
        else if (player.jumpState > 0) //Mitt i ett hopp
        {
            player.ySpeed = 0;
            player.ySpeed -= player.jumpState;
            player.jumpState --;
            
        }
        else if(player.jumpState <= 0)
        {
            player.ySpeed = 0;
        }
        
        if(keys[65])//A
        {
            if(map.mapArray[playerRow][Math.floor((player.posX - player.runningSpeed) / map.tileSize)] === 0)
            {
                player.direction = 1;
                player.posX -= player.runningSpeed;
            }
            else
            {
                player.direction = 1;
                player.posX = playerColL * map.tileSize;
            }
        }

        else if(keys[68])//D
        {
            if(map.mapArray[playerRow][Math.floor((player.posX + player.side + player.runningSpeed) / map.tileSize)] === 0)
            {
                player.direction = 0;
                player.posX += player.runningSpeed;  
            }
            else
            {
                player.direction = 0;
                player.posX = playerColL * map.tileSize + (map.tileSize - player.side-1); 
                
            }
        }

        
        //slag
        if(keys[16] && player.hitState === 0) //Shift
        {
            player.hitting(map,monsters);
            player.hitState = 30;   
        }  
        //Hindrar spelaren från att hålla in slå-knappen och krossa allt.
        else if(player.hitState !== 0)
        {
            player.hitState--;
        }
        
        //gravity
        player.ySpeed += 10;

        //flytta spelare i höjdled 
        player.posY += player.ySpeed;
        

        //nytt monster spawnar
        socket.on("monster", function(data)
        {
            spawnMonster(data, monsters, map);
        });        
        
        //kollision med väggar eller monster
        cd.detectWallCollision();
        cd.detectMonsterWallCollision();
        

        //rita bana och karaktär på nytt
        renderer(map,player,monsters);
        
        //kolla om några monster slagit ihjäl spelare.
        var dead = cd.detectMonsterCollision();
        var won = (playerRow === 3 && (map.mapArray[playerRow+1][playerColL] > 0 || map.mapArray[playerRow+1][playerColR] > 0 ));
        
        //spelloopen stängs av ifall spelaren dör
        if(dead || won )
        {
            clearInterval(gameLoop);
            
            //om man vinner
            if(won)
            {
                winLoop(canvas, context)
            }
            else if(dead)
            {
                deathLoop(canvas, context)
            }
        }
        
<<<<<<< HEAD
=======
        console.log(player.direction)
>>>>>>> 0cb78d6cd940d392b6045cc5efe5d40455ea781b
        
    }, frameTime);
    
};


/**
 * När ett objekt har skapats av servern och skickats till spelet så anropas denna funktion.
 * Den tar emot data från servern och skapar sedan ett monster genom att anropa en av flera 
 * konstruktorer
 * 
 * @param   data        innehåller data om monstret som ska skapas
 * @param   monsters    arrayen som innehåller alla monster. nya monster pushas hit
 * @param   map         kartan som används i denna game-instance
 */
var monsterNumber = 0;
Game.prototype.spawnMonster = function(data, monsters, map)
{
    var monster;

    //Varje monster ska bara visa sig en gång.
    if(data.monsterNumber == monsterNumber)
    {
        monsterNumber++; //nästa monster, tack!
        
        //skapar ett nytt monster
        if(data.monsterType === 0)
        {
            monster = new Bat(data.monsterType, data.monsterFloor, data.monsterDirection, map);
        }
        else if(data.monsterType === 1)
        {
            monster = new Troll(data.monsterType, data.monsterFloor, data.monsterDirection, map);
        }
        else if(data.monsterType === 2)
        {
            monster = new FallingRock(data.monsterType, data.monsterFloor, data.monsterDirection, map);
        }
        monsters.push(monster);
    }
}

/**
 * Funktion som anropar andra funktioner som ritar spelare, monster och bana
 * 
 * @param   map         banan som ska ritas
 * @param   player      spelaren som ska ritas
 * @param   monsters    array med alla monster   
 */
//funktion som anropar funktioner för att rita objekt i spelet.
Game.prototype.renderer = function(map,player,monsters)
{
    //Canvas hämtas    
    var canvas = document.getElementById("gamecanvas");
    var context = canvas.getContext("2d");  
    
    //ta bort tidigare ritat på canvas
    context.clearRect(0,0,canvas.width,canvas.height);

    //karta
    map.renderMap(context);   
    
    //flytta och rita varje monster
    monsters.forEach(function(monster)
    {
        //fladdermus
        if(monster.type === 0)
        {
            monster.renderBat(context); 
        }
        
        //troll
        else if (monster.type === 1)
        {
            monster.renderTroll(context, player);
        }
        
        //falling rock
        else if(monster.type === 2)
        {
            monster.renderFallingRock(context);
        }
        
    });  
    
    //spelare
    player.renderPlayer(context);     


  
    
}


/**
 * Ritar menyer i början av spelet och gör dem interaktiva genom att 
 * lyssna på olika events
 */
//Visa huvudmenyn
Game.prototype.gameMenu = function()
{
    
    var canvas = this.canvas;
    var context = this.context;
    var game = this;
    
    var fontSize = 18;
    var buttonWidth = 300;
    var buttonHeight = 60;

    var gap = 100;
    
    var mainmenu = true;
    
    //singleplayer knappen
    context.fillStyle = "#DDDDDD";
    context.fillRect(canvas.width/2 - buttonWidth/2 , canvas.height/2 - buttonHeight/2, buttonWidth, buttonHeight);
    
    context.fillStyle = "black";
    context.font = fontSize+"px Arial";
    context.textAlign = "center";
    context.fillText("Singleplayer", canvas.width/2  , canvas.height/2+fontSize/2);
    
    
    //multiplayer knappen
    context.fillStyle = "#DDDDDD";
    context.fillRect(canvas.width/2 - buttonWidth/2 , canvas.height/2 - buttonHeight/2 + gap+buttonHeight, buttonWidth, buttonHeight);
    
    context.fillStyle = "black";
    context.font = fontSize+"px Arial";
    context.fillText("Multiplayer", canvas.width/2  , canvas.height/2 + gap + buttonHeight + fontSize/2);
    
    //funktion som körs när användaren interagerar med spelmenyn
    function menuFunction(e)
        {
            var mouseX = e.x - canvas.offsetLeft;
            var mouseY = e.y - canvas.offsetTop;
            
            if(mainmenu && mouseX >= canvas.width/2 - buttonWidth/2 && mouseX <= canvas.width/2 + buttonWidth/2 && mouseY >= canvas.height/2 - buttonHeight/2 && mouseY <= canvas.height/2 + buttonHeight/2)
            {
                canvas.removeEventListener("click",menuFunction,false);
                game.getInstructions("sp");
            }
            else if(mainmenu && mouseX >= canvas.width/2 - buttonWidth/2 && mouseX <= canvas.width/2 + buttonWidth/2 && mouseY >= canvas.height/2 - buttonHeight/2 + gap + buttonHeight && mouseY <= canvas.height/2 - buttonHeight/2 + gap + buttonHeight*2)
            {
                mainmenu = false;
                
                //ta bort tidigare meny
                context.clearRect(0,0,canvas.width,canvas.height);
                
                //multiplayer online
                context.fillStyle = "#DDDDDD";
                context.fillRect(canvas.width/2 - buttonWidth/2 , canvas.height/2 - buttonHeight/2, buttonWidth, buttonHeight);
                
                context.fillStyle = "black";
                context.font = fontSize+"px Arial";
                context.textAlign = "center";
                context.fillText("Play with stranger", canvas.width/2  , canvas.height/2+fontSize/2);
                
                
                //multiplayer knappen
                context.fillStyle = "#DDDDDD";
                context.fillRect(canvas.width/2 - buttonWidth/2 , canvas.height/2 - buttonHeight/2 + gap+buttonHeight, buttonWidth, buttonHeight);
                
                context.fillStyle = "black";
                context.font = fontSize+"px Arial";
                context.fillText("Play with friend(Share keyboard)", canvas.width/2  , canvas.height/2 + gap + buttonHeight + fontSize/2);
                
            }
            
            else if(!mainmenu && mouseX >= canvas.width/2 - buttonWidth/2 && mouseX <= canvas.width/2 + buttonWidth/2 && mouseY >= canvas.height/2 - buttonHeight/2 && mouseY <= canvas.height/2 + buttonHeight/2)
            {
                canvas.removeEventListener("click",menuFunction,false);
                alert("online mp")
            }
             else if(!mainmenu && mouseX >= canvas.width/2 - buttonWidth/2 && mouseX <= canvas.width/2 + buttonWidth/2 && mouseY >= canvas.height/2 - buttonHeight/2 + gap + buttonHeight && mouseY <= canvas.height/2 - buttonHeight/2 + gap + buttonHeight*2)
            {
                canvas.removeEventListener("click",menuFunction,false);
                alert("splitscreen mp")
            }
        }
    
    //event listeners till knapparna.
    this.canvas.addEventListener("click",menuFunction,false);
    
}


/**
 * Skapar en ruta med instruktioner åt användaren.
 * Vad som står i rutan beror på spelläge(mp eller sp)
 * 
 * @param   mode    spelläge som texten ska vara anpassad för
 */
//metod som skapar en ruta med instruktioner
Game.prototype.getInstructions = function(mode)
{
    var game = this;
    
    var boxWidth = 300;
    var boxHeight = 400;
    
    var fontSize = 20;
    
    this.context.fillStyle = "#DDDDDD";
    this.context.fillRect(this.canvas.width/2 - boxWidth/2 , this.canvas.height/2 - boxHeight/2, boxWidth, boxHeight);
    
    this.context.fillStyle = "black";
    this.context.font= fontSize+"px Arial";
    this.context.fillText("Hello World!", this.canvas.width/2 , this.canvas.height/2 - boxHeight/2 + fontSize);
    
    //funktion som körs när spelaren klickar på enter
    function start(event)
    {
            if(event.keyCode == 13)
            {
                document.removeEventListener('keydown',start,false)
                //säger till servern att spelet startar.
                
                game.gameInit();//startar spelet.

            }
        
        
    }
    
    //Klicka på Enter för att ta bort 
    document.addEventListener('keydown', start, false)
    
}
/**
 * Loop som körs för spelare som dör. Visar ett meddelande och skickar tillbaka 
 * spelaren till huvudmenyn.
 * 
 * @param   canvas  canvas-elementet
 * @param   context canvas-elementets context
 */
//funktion som körs när man dör
Game.prototype.deathLoop = function(canvas,context)
{
    var boxWidth = 600;
    var boxHeight = 800;
    
    
    var fontSize = 50;
    
    context.fillStyle = "DDDDDD";
    context.fillRect(canvas.width/2 - boxWidth/2 , canvas.height/2 - boxHeight/2, boxWidth, boxHeight);
    
    context.fillStyle = "black";
    context.font= fontSize+"px Arial";
    context.fillText("Du dog jättemycket!", canvas.width/2 - boxWidth/2 , canvas.height/2 - boxHeight/2 + fontSize);
}



/**
 * Loop som körs för spelare som vinner. Visar ett meddelande och skickar tillbaka 
 * spelaren till huvudmenyn.
 * 
 * @param   canvas  canvas-elementet
 * @param   context canvas-elementets context
 */
Game.prototype.winLoop = function(canvas,context)
{
    var boxWidth = 600;
    var boxHeight = 800;
    
    var fontSize = 50;
    
    context.fillStyle = "DDDDDD";
    context.fillRect(canvas.width/2 - boxWidth/2 , canvas.height/2 - boxHeight/2, boxWidth, boxHeight);
    
    context.fillStyle = "black";
    context.font= fontSize+"px Arial";
    context.fillText("Grattis! Du vann", canvas.width/2 - boxWidth/2 , canvas.height/2 - boxHeight/2 + fontSize);
}






