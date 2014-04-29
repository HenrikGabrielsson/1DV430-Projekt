var init = function(){
    
    var socket = io.connect();
    socket.emit('sendMap', {gameMode:"sp"}); //skicka single-player-bana
    socket.on('map', function(data){
        
        var sprite = new Image();
        sprite.src ="pics/tileset1.png";
        
        //skapa ett nytt map-objekt
        var map = new Map(data.map,sprite);
        
        
        //skapa spelare och ange startposition
        var player = new Player(map.tileSize * 5,(map.rows-2) * map.tileSize);
        
        //lyssnar efter input från spelare
        var keys = []; //här sparas de tangenter som trycks ner med en boolean som bestämmer om de fortfarande är nertryckta
        
        //så här många pixlar/frameTime springer spelare.
        var runningSpeed = 3;
    
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
            var playerColL = Math.floor(player.posX / map.tileSize);
            var playerColR = Math.floor((player.posX+player.side) / map.tileSize);
            
            
            //kolla om karaktären vann(kom till toppen)
            if(playerRow === 3 && (map.mapArray[playerRow+1][playerColL] > 0 || map.mapArray[playerRow+1][playerColR] > 0 ))
            {
                console.log("du vann!");
            }
            
            //Styrning av karaktär och slag
            if(keys[87] && (map.mapArray[playerRow+1][playerColL] > 0 || map.mapArray[playerRow+1][playerColR] > 0 ) && player.jumpState === 0 )//W och står på en plattform
            {
                player.ySpeed = 0; //återställer
                
                player.jumpState = 28; 
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
                player.xSpeed = -runningSpeed;
            }

            else if(keys[68])//D
            {
                player.xSpeed = runningSpeed;  
                
            }
            else //om varken A/D är nedtryckta
            {
                player.xSpeed = 0;
            }
            
            //slag
            if(keys[16] && player.hitState === 0) //Shift
            {
                hitBlock(player,map);
                player.hitState = 15;   
            }  
            //Hindrar spelaren från att hålla in slå-knappen och krossa allt.
            else if(player.hitState !== 0)
            {
                player.hitState--;
            }
            
            
            //gravity
            player.ySpeed += 8;
            
            //ändra spelarens position
            player.moveX();
            player.moveY();
            
            
            //collision detection
            detectCollision(player,map);
            
            //rita bana och karaktär på nytt
            renderer(map,player);
            
        }, frameTime);
        
    });
    
};
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
    var playerColL = Math.floor(player.posX / map.tileSize);
    var playerColR = Math.floor((player.posX+player.side) / map.tileSize);    
    
    if(player.xSpeed > 0) //slag åt höger
    {
        map.mapArray[playerRow][playerColR+1] = changeBlock(map.mapArray[playerRow][playerColR+1]);
    }
    else if(player.xSpeed < 0 ) //slag åt vänster
    {
        map.mapArray[playerRow][playerColL-1] = changeBlock(map.mapArray[playerRow][playerColL-1]);
    }
    
    else if(map.mapArray[playerRow-1][playerColL] > 0 || map.mapArray[playerRow-1][playerColR] > 0)//slag upp
    {
        if(map.mapArray[playerRow-1][playerColL] > 0)
        {
            map.mapArray[playerRow-1][playerColL] = changeBlock(map.mapArray[playerRow-1][playerColL]);
        }
        else 
        {
            map.mapArray[playerRow-1][playerColR] = changeBlock(map.mapArray[playerRow-1][playerColR]);
        }
        
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