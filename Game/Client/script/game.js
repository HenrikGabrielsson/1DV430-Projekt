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
    var mapArray = []; //här sparas banan

    var k = 0; //index i seedet
    for (var i = 0; i <= 50; i++)//rader 
    {
        mapArray[i] = [];
        
        
        for (var j = 0; j < 40; j++) //kolumner
        {
            if(i === 50)
            {
                mapArray[i][j] = 9; //längst ner finns ett golv av oförstörbara tiles
            }
            else if(i % 5 === 0) //plattformar ska finnas på var 5:e rad
            {
                mapArray[i][j] = seed[k]; //lägger in numret i rätt fält.
                k++;        
            }
            else //annars tomrum
            {
                mapArray[i][j] = 0;
            }
            
        }
        
    }

    return mapArray;
    
}

function renderMap(mapArray)
{
    var canvas = document.getElementById("gamecanvas");
    var context = canvas.getContext("2d");  
    
    var tileSize = 20;
    
    var rows = 51;
    var cols = 40;
   
    canvas.width = tileSize * cols;
    canvas.height= tileSize * rows;
   
    
    for (var i = 0; i < rows; i++) 
    {
        for (var j = 0; j < cols; j++) 
        {
            switch(mapArray[i][j])
            {
                case 0:
                    break;
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                    context.fillStyle = "#ff0000";
                    context.fillRect(j*tileSize,i*tileSize,tileSize,tileSize);
                    break;
                case 6:
                case 7:
                    context.fillStyle = "#aa0000";
                    context.fillRect(j*tileSize,i*tileSize,tileSize,tileSize);
                    break;
                case 8:
                    context.fillStyle = "#00ff00";
                    context.fillRect(j*tileSize,i*tileSize,tileSize,tileSize);
                    break;
                case 9:
                    context.fillStyle = "#000000";
                    context.fillRect(j*tileSize,i*tileSize,tileSize,tileSize);
                    break;
            }
        }    
    }   
    
    
    
}
