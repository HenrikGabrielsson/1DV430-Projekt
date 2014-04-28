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

            keys[event.keyCode] = true;
        });
        
        //släpper tangent
        document.addEventListener('keyup', function(event) {
            keys[event.keyCode] = false;
        });
        
        
        //så här ofta ska spel-loopen köras
        var frameTime = 1000/60;
        
        //Spel-loopen
        setInterval(function()
        {

            //ta reda på vilken ruta i banans tileset som spelaren befinner sig i
            var playerRow = Math.floor(player.posY / map.tileSize);
            var playerCol = Math.floor(player.posX / map.tileSize);
            
            
            //Styrning av karaktär och slag
            if(keys[87] && map.mapArray[playerRow+1][playerCol] > 0 )//W och står på en plattform
            {
                player.jumpState = 10; 
                player.ySpeed = -3 * player.jumpState;

            }
            else if (player.jumpState > 0) //Mitt i ett hopp
            {
                player.ySpeed = -3 * player.jumpState;
                player.jumpState--;
                
            }
            else
            {
                player.ySpeed = 0;
            }
            
            
            
            if(keys[65])//A
            {
                player.xSpeed = -2;
            }

            else if(keys[68])//D
            {
                player.xSpeed = 2;  
                
            }
            else //om varken A/D är nedtryckta
            {
                player.xSpeed = 0;
            }
            
            //slag
            if(keys[16]) //Left Shift
            {
                console.log("punch");
                hitBlock(player,map);
                
            }  
            
            
            //gravitation 
            player.ySpeed += 10;
            
            //ändra spelarens position
            player.moveX();
            player.moveY();

            
            //collision detection
            playerRow = Math.floor(player.posY / map.tileSize);
            playerCol = Math.floor(player.posX / map.tileSize);
            
            
            //finns nåt till höger?
            if(map.mapArray[playerRow][playerCol+1] > 0 && player.xSpeed > 0)
            {
                player.posX = playerCol * map.tileSize + map.tileSize - player.side;
            }
            
            //finns nåt till vänster?
            if(map.mapArray[playerRow][playerCol] > 0 && player.xSpeed < 0)
            {
                player.xSpeed = 0;
                player.posX = (playerCol+1) * map.tileSize;
                
            }
            
            playerRow = Math.floor(player.posY / map.tileSize);
            playerCol = Math.floor(player.posX / map.tileSize);


            if(map.mapArray[playerRow+1][Math.floor((player.posX+player.side) / map.tileSize)] > 0 && player.xSpeed < 0)
            {
                player.posY = playerRow * map.tileSize + map.tileSize - player.side;
            }

            //finns nåt under?
            if(map.mapArray[playerRow+1][playerCol] > 0 && player.ySpeed >= 0)
            {
                player.posY = playerRow * map.tileSize + map.tileSize - player.side;
            }
            
            
            //finns nåt över(i ett högt hopp)
            if(player.jumpState*3 > map.tileSize && map.mapArray[playerRow-1][playerCol] > 0)
            {
                player.posY = (playerRow+1) * map.tileSize;
            }   
            
            //finns nåt över?
            if(map.mapArray[playerRow][playerCol] > 0)
            {
                player.posY = (playerRow + 1) * map.tileSize;
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

//bestämmer vilket block som har slagits
function hitBlock(player,map)
{
    
    //ta reda på vilken ruta i banans tileset som spelaren befinner sig i
    var playerRow = Math.floor(player.posY / map.tileSize);
    var playerCol = Math.floor(player.posX / map.tileSize);
    
    if(player.xSpeed > 0) //slag åt höger
    {
        map.mapArray[playerRow][playerCol+1] = changeBlock(map.mapArray[playerRow][playerCol+1]);
    }
    else if(player.xSpeed < 0 ) //slag åt vänster
    {
        map.mapArray[playerRow][playerCol-1] = changeBlock(map.mapArray[playerRow][playerCol-1]);
    }
    
    if(map.mapArray[playerRow-1][playerCol] > 0)
    { 
        
        map.mapArray[playerRow-1][playerCol] = changeBlock(map.mapArray[playerRow-1][playerCol]);
    }
}

//ändrar ett block på banan efter ett slag
function changeBlock(hitBlock)
{
    switch(hitBlock)
    {
        //inget block och 1-slagsblock returnerar 0;
        case 0:
        case 6:
        case 7:
            return 0;
        //tvåslagsblock och väggar blir ettslagsblock;
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
        case 8:
            return 6;
        //oslagbara block påverkas inte.
        case 9:
            return 9;
            
    }
}



