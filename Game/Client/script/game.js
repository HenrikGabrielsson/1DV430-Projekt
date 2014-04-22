var init = function(){
    
    var socket = io.connect();
    socket.emit('sendMap', {gameMode:"sp"}); //skicka single-player-bana
    socket.on('map', function(data){
        
        
        //skapa ett nytt map-objekt
        var map = new Map(data.map);
        
        //skapa spelare och ange startposition
        var player = new Player(map.tileSize * 5,(map.rows-2) * map.tileSize);
        
        
        //lyssnar efter input från spelare
        var keys = []; //här sparas de tangenter som trycks ner med en boolean som bestämmer om de fortfarande är nertryckta
        
    
        //trycker på tangent
        document.addEventListener('keydown', function(event) {
            event.preventDefault();
            keys[event.keyCode] = true;
        });
        
        //släpper tangent
        document.addEventListener('keyup', function(event) {
            event.preventDefault();
            keys[event.keyCode] = false;
        });
        
        
        
        
        //så här ofta ska spel-loopen köras
        var frameTime = 1000/60;
        
        //Spel-loopen
        setInterval(function()
        {
            //Styrning av karaktär och slag
            if(keys[87])//W
            {
                player.jump();    
            }
            if(keys[65])//A
            {
                player.moveLeft();    
            }
            if(keys[68])//D
            {
                player.moveRight();    
            }
            if(keys[16]) //Left Shift
            {
                console.log("punch");
            }
            
            //gravitation
            player.fall();
            
            //collision detection
            //ta reda på vilken ruta i banans tileset som spelaren befinner sig i;
            var playerRow = Math.floor(player.posY / map.tileSize);
            var playerCol = Math.floor(player.posX / map.tileSize);
            
            //finns nåt under?
            if(map.mapArray[playerRow+1][playerCol] > 0)
            {
                player.posY = playerRow * map.tileSize;
            }
            
            //finns nåt över?
            if(map.mapArray[playerRow-1][playerCol] > 0)
            {
                player.posY = (playerRow+1) * map.tileSize;
            }
            
            //finns nåt till höger?
            if(map.mapArray[playerRow][playerCol+1] > 0)
            {
                player.posX = playerCol * map.tileSize;
            }
            
            //finns nåt till vänster?
            if(map.mapArray[playerRow][playerCol-1] > 0)
            {
                player.posX = (playerCol+1) * map.tileSize;
            }
            
            
            
            
            
            //rita bana och karaktär på nytt
            renderer(map,player);
            
        }, frameTime);
        
    })
    
}

window.onload = init();



//funktion som ritar både spelare och karta.
function renderer(map,player)
{
            
    //Canvas hämtas    
    var canvas = document.getElementById("gamecanvas");
    var context = canvas.getContext("2d");  
    
    //ta bort tidigare ritat på canvas
    context.clearRect(0,0,canvas.width,canvas.height);
    
    map.renderMap(canvas,context);
    player.renderPlayer(context);   
    
    
}


