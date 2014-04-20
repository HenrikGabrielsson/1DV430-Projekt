var init = function(){
    
    var socket = io.connect();
    socket.emit('sendMap', {gameMode:"sp"}); //skicka single-player-bana
    socket.on('map', function(data){
        
        //funktion som skapar kartan.
        var mapArray = createMap(data.map, "sp");
        
        //Canvas hämtas    
        var canvas = document.getElementById("gamecanvas");
        var context = canvas.getContext("2d");          
        
        //så här ofta ska spel-loopen köras
        var frameTime = 1000/60;
        
        //skapa spelare och ange startposition
        var player = new Player(100,0);
        
        var map = renderMap(mapArray,canvas,context); //rita banan
        player.renderPlayer(context); //rita spelare
        
        //Spel-loopen
        setInterval(function()
        {
            player.moveRight();
            player.renderPlayer(context);
            
        }, frameTime);
        
    })
    
}

window.onload = init();



//Den här funktionen tar emot ett seed och en speltyp och skapar en bana (en tvådimensionell array).
function createMap(seed, gameMode)
{
    var mapArray = []; //här sparas banan

    var rows = 76;
    var cols = 40;

    var seedIndex = 0; //index i seedet
    for (var i = 0; i <= rows; i++)//rader 
    {
        mapArray[i] = [];
        
        
        for (var j = 0; j < cols; j++) //kolumner
        {
            
            if(i === rows) //längst ner finns ett golv av oförstörbara tiles
            {
                mapArray[i][j] = 9; 
            }
            //j < i/2 + 2
            else if(i % 4 === 0 && ((j > cols/2 - ((i/4) + 2)) && (j < cols/2 + ((i/4) + 2))  )) //plattformar ska finnas på var 4:e rad. De ökar med 2 rutor varje gång.
            {
                //De översta våningarna ska alltid vara likadana och behöver inte använda seedet för att genereras .
                if(i === 0 || i === 4)
                {
                    mapArray[i][j] = 1;
                }
                else
                {
                mapArray[i][j] = seed[seedIndex]; //lägger in numret i rätt fält.
                seedIndex++;        
                }
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

function renderMap(mapArray,canvas,context)
{
    
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
