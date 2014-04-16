var init = function(){
    
    var socket = io.connect();
    socket.emit('sendMap', {gameMode:"sp"}); //skicka single-player-bana
    socket.on('map', function(data){
        var mapArray = createMap(data.map, "sp");
        renderMap(mapArray);
    })
    
}

window.onload = init();

//Den här funktionen tar emot ett seed och en speltyp och skapar en bana (en tvådimensionell array).
function createMap(seed, gameMode)
{
    var mapArray = new Array(); //här sparas banan

    var k = 0; //numret från seedet
    for (var i = 0; i < 10; i++)//rader 
    {
        mapArray[i] = [];
        for (var j = 0; j < 40; j++) //kolumner
        {
            mapArray[i][j] = seed[k]; //lägger in numret i rätt fält.
            k++;
            
        }
    }
    
    
    return mapArray
    
}

function renderMap(mapArray)
{
    var canvas = document.getElementById("GameCanvas");
    var context = canvas.getContext("2d");  
    
    var tileSize = 20;
   
    canvas.width = tileSize * 40;
    canvas.height= tileSize * 10;
   
    context.fillStyle = "#ff0000";
    context.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < 10; i++) 
    {
        for (var j = 0; j < 40; j++) 
        {
            if(mapArray[i][j] > 0)
            {
                context.fillRect(j*tileSize,i*tileSize,tileSize,tileSize);
            }
        }    
    }
    
}

