//konstruktorfunktion som skapar kartan
function Map (seed)
{
    this.seed = seed;
    this.mapArray = this.createMap(this.seed)
    
    //banans höjd och bredd i tiles
    this.rows = 77; 
    this.cols = 40;
    this.tileSize = 20;    

}

//Den här funktionen tar emot ett seed och skapar en bana (en tvådimensionell array).
Map.prototype.createMap = function(seed)
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
            if(j === 0 || j === 39)
            {
                mapArray[i][j] = 9;
            }
                
            else if(i === rows) //längst ner finns ett golv av oförstörbara tiles
            {
                mapArray[i][j] = 9; 
            }
        
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
            //man ska inte kunna gå utanför "pyramiden" så allt där blir oslagbara rutor.
            else if(    (j < cols/2 - ((i/4) + 2)) || (j > cols/2 + ((i/4) + 2)) )
            {
                mapArray[i][j] = 9;
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

//Funktion som ritar banan. tar emot mapArray(tileset som beskriver vad som ska ritas) och canvas + context
Map.prototype.renderMap = function(canvas,context)
{
    //en tile(ruta)s sida i px
    
   //hur stor ska canvas vara
    canvas.width = this.tileSize * this.cols;
    canvas.height= this.tileSize * this.rows;
    
    
    
    for (var i = 0; i < this.rows; i++) //rader
    {
        for (var j = 0; j < this.cols; j++) //kolumner
        {
            //switch tittar på varje siffra i arrayen och bestämmer vad som ska ritas på aktuell position
            switch(this.mapArray[i][j])
            {
                case 0: //tom
                    break;
                    
                //1-5: rutor som kräver två slag för att krossas    
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                    context.fillStyle = "#aa0000";
                    context.fillRect(j*this.tileSize,i*this.tileSize,this.tileSize,this.tileSize);
                    break;
                //6-7: rutor som kräver ett slag för att krossas
                case 6:
                case 7:
                    context.fillStyle = "#ff0000";
                    context.fillRect(j*this.tileSize,i*this.tileSize,this.tileSize,this.tileSize);
                    break;
                case 8: //vägg
                    context.fillStyle = "#aa0000";
                    context.fillRect(j*this.tileSize,i*this.tileSize,this.tileSize,this.tileSize);
                    break;
                case 9: //oförstörbar
                    context.fillStyle = "#000000";
                    context.fillRect(j*this.tileSize,i*this.tileSize,this.tileSize,this.tileSize);
                    break;
                default:
                    break;
            }
        }    
    }   
}