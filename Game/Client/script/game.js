var init = function(){
    
    var socket = io.connect();
    socket.emit('sendMap', {gameMode:"sp"}); //skicka single-player-bana
    socket.on('map', function(data){
        
        //funktion som skapar kartan.
        var mapArray = createMap(data.map, "sp");
        
        //så här ofta ska spel-loopen köras
        var frameTime = 1000/60;
        
        //skapa spelare och ange startposition
        var player = new Player();
        alert(player.right);
    
        //Spel-loopen
        setInterval(function()
        {
            
            renderMap(mapArray); //rita banan
        }, frameTime);
        
    })
    
}

window.onload = init();



//Den här funktionen tar emot ett seed och en speltyp och skapar en bana (en tvådimensionell array).
function createMap(seed, gameMode)
{
    var mapArray = []; //här sparas banan

    var seedIndex = 0; //index i seedet
    for (var i = 0; i <= 76; i++)//rader 
    {
        mapArray[i] = [];
        
        
        for (var j = 0; j < 40; j++) //kolumner
        {
            if((i === 0 || i === 4) && j < i/2 + 2  ) //De två översta våningarna ser alltid likadana ut.
            {
                mapArray[i][j] = 1;
            }
            
            else if(i === 76) //längst ner finns ett golv av oförstörbara tiles
            {
                mapArray[i][j] = 9; 
            }
            else if(i % 4 === 0 && j < i/2 + 2) //plattformar ska finnas på var 5:e rad
            {
                
                mapArray[i][j] = seed[seedIndex]; //lägger in numret i rätt fält.
                seedIndex++;        
            }
            else //annars tomrum
            {
                if(i > 0 && mapArray[i-1][j] === 8) //om rutan ovan visar att det ska finnas en vägg här så fortsätter väggen neråt.
                {
                    mapArray[i][j] = 8;    
                }
                else
                {
                    mapArray[i][j] = 0;
                }
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
    
    var rows = 77;
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
                    context.fillStyle = "#aa0000";
                    context.fillRect(j*tileSize,i*tileSize,tileSize,tileSize);
                    break;
                case 6:
                case 7:
                    context.fillStyle = "#ff0000";
                    context.fillRect(j*tileSize,i*tileSize,tileSize,tileSize);
                    break;
                case 8:
                    context.fillStyle = "#aa0000";
                    context.fillRect(j*tileSize,i*tileSize,tileSize,tileSize);
                    break;
                case 9:
                    context.fillStyle = "#000000";
                    context.fillRect(j*tileSize,i*tileSize,tileSize,tileSize);
                    break;
                default:
                    break;
            }
        }    
    }   
}
