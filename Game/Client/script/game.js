﻿/**
 * Konstruktor för Game-objektet
 * 
 * @param   data    Innehåller seed till banan som ska skapas
 * @param   canvas  Referens till canvas-elementet
 * @param   context Canvas-elementets context(2d);
 */
function Game(data,canvas,context)
{
    this.canvas = canvas;
    this.context = context;
    this.socket = io.connect();
    this.gameMode = data.gameMode;

    this.map = new Map(data, canvas);
    
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
 
    var gameMode = this.gameMode;
       
    var socket = this.socket;
    
    socket.emit("gameIsOn", {gameMode:gameMode});
    
    var canvas = this.canvas;
    var context = this.context;
    
    var map = this.map;
    var monsters = this.monsters;
    
    var frameCounter = 0;
    
    var spawnMonster = this.spawnMonster;
    var renderer = this.renderer;
    var deathLoop = this.deathLoop;
    var winLoop = this.winLoop;
    
    //skapa spelare och ange startposition
    var player = new Player(map.tileSize * 5,(map.rows-2) * map.tileSize);
    
    var cd = new CollisionDetector(map, player, monsters);
    
    //lyssnar efter input från spelare
    var keys = listenToKeyboardInput();; //här sparas de tangenter som trycks ner med en boolean som bestämmer om de fortfarande är nertryckta

    //så här ofta ska spel-loopen köras
    var frameTime = 1000/60;

    var mapPieces = 0;
    
    //Spel-loopen
    var gameLoop = setInterval(function()
    {
        //ta reda på vilken ruta i banans tileset som spelaren befinner sig i
        var playerRow = Math.floor(player.posY / map.tileSize);
        var playerColL = Math.floor(player.posX / map.tileSize);
        var playerColR = Math.floor((player.posX+player.width) / map.tileSize);
              
        //anropar funktion som utför det spelaren ber om.
        playerAction(keys, player, cd);


        //nytt monster spawnar
        socket.on("monster", function(data)
        {
            spawnMonster(data, monsters, map);
        });        

        //med jämna mellanrum tar spelet emot mer av banan från servern.
        if(gameMode === "mp" )
        {
            socket.on("moreMap", function(data){
                if(mapPieces === data.count)
                {
                    map.addMoreMap(data.map, player, monsters);
                    mapPieces++;
                }
            })
        }


        //kollision med väggar eller monster
        cd.detectMonsterWallCollision();
        cd.detectMonsterCollision();

        //rita bana och karaktär på nytt
        renderer(map,player,monsters, frameCounter);

        if(gameMode === "sp") //vid sp så vinner man när man når toppen
        {
            var won = (playerRow === 3 && (map.mapArray[playerRow+1][playerColL] > 0 || map.mapArray[playerRow+1][playerColR] > 0 ));
        }

     



        //spelloopen stängs av ifall spelaren dör
        if(player.isDead || won )
        {
            clearInterval(gameLoop);
            
            //om man vinner
            if(won)
            {
                winLoop(canvas, context)
            }
            else if(player.isDead)
            {
                deathLoop(canvas, context)
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
Game.prototype.renderer = function(map, player, monsters, frameTime)
{
    //canvasen börjar inte flytta banan nedåt på 2 sekunder efter att spelet startat
    var currentPos;
    if(frameTime < 120)
    {
        currentPos = 0;
    }
    else 
    {
        currentPos = frameTime-120;
    }

    //Canvas hämtas    
    var canvas = document.getElementById("gamecanvas");
    var context = canvas.getContext("2d");  

    //Toppen, center och vänsterkanten av canvasen. Behövs för att bestämma vad som ska renderas och var. 
    var canvasTop = (map.tileSize * map.rows) - (canvas.height+currentPos);    
    var canvasCenter = canvas.width/2;
    var canvasLeft = player.posX - (canvasCenter-player.width/2);

    //ta bort tidigare ritat på canvas
    context.clearRect(0,0,canvas.width,canvas.height);
  
    player.renderPlayer(context, canvasTop, canvasCenter);    
    
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
  
    //kollar om spelaren dör (av brist på livslust för att dom nådde botten av fönstret)
    if(player.posY + player.height/2 > canvasTop + canvas.height)
    {
        player.isDead = true;        
    }
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
    var boxWidth = canvas.width/2;
    var boxHeight = canvas.height/2;
    
    
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
    var boxWidth = canvas.width/2;
    var boxHeight = canvas.height/2;
    
    var fontSize = 50;
    
    context.fillStyle = "DDDDDD";
    context.fillRect(canvas.width/2 - boxWidth/2 , canvas.height/2 - boxHeight/2, boxWidth, boxHeight);
    
    context.fillStyle = "black";
    context.font= fontSize+"px Arial";
    context.fillText("Grattis! Du vann", canvas.width/2 - boxWidth/2 , canvas.height/2 - boxHeight/2 + fontSize);
}
