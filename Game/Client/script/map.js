/**
 * Konstruktor till Map-objektet. Tar emot ett seed och skapar då en bana.
 * Läser in sprites rill de olika blocken.
 * Sätter storleken på canvas.
 * 
 * @param   seed    data som bestämmer hur banan ska se ut.
 * @param   canvas  canvas-elementet där banan ska ritas.
 */
function Map (data,canvas)
{
    //hämtar banan som servern genererade och spelläge.
    this.seed = data.map;
    this.gameMode = data.gameMode;

    //banans höjd och bredd i tiles
    if(this.gameMode === "sp")
    {
        this.rows = 81; 
    }
    else if(this.gameMode ==="mp1" || this.gameMode === "mp2")
    {
        this.rows = 41;
    }
    this.cols = 40; 


    this.mapArray = this.createMap(this.seed);

    this.tileSize = 64;
    
    this.sprite = new Image();
    this.sprite.src = "pics/tileset.png";

}



/**
 * Funktion som tar emot ett seed och skapar sedan ett tileset för banan. Alltså en 
 * multidimensionell array med data om vilken typ av block som ska finnas på varje 
 * tile.
 * 
 * @param   seed            "kod" som bestämmer banans utseende
 * @param   startPlatform   Bool. Bestämmer om en "startplattform" ska skapas. 
 * @return          En multidimensionell array som 
 */
//Den här funktionen tar emot ett seed och skapar en bana (en tvådimensionell array).
Map.prototype.createMap = function(seed, startPlatform)
{
    var mapArray = [];

    //default: true
    if(startPlatform === undefined){startPlatform = true}

    //singleplayer-bana
    if(this.gameMode === "sp")
    {
        var rows = 76;
        var cols = 40;

        var seedIndex = 0; //index i seedet
        for (var i = 0; i <= rows; i++)//rader 
        {
            mapArray[i] = [];
           
            for (var j = 0; j < cols; j++) //kolumner
            {

                if(j === 0 || j === cols-1 || i === rows) //oförstörbara tiles omringar banan. ingen får fly...
                {
                    mapArray[i][j] = 10;
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
                    mapArray[i][j] = 10;
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
        //lägger till lite utrymme över översta plattformen
        for(var k = 0;k<4;k++)
        {
            mapArray.unshift([]);
            for(var l = 0; l<cols; l++)
            {
                if(l < 17 || l > 21)
                {
                   mapArray[0].unshift(10); 
                }
                else
                {
                    mapArray[0].unshift(0);
                }
            }
        }

    }




    //multiplayer-bana
    else if(this.gameMode === "mp1" ||this.gameMode === "mp2")
    {

        var rows;
        if(startPlatform)
        {
            var rows = 41;
        }
        else
        {
            var rows = 40;
        }
        
        var cols = 40;

        var seedIndex = 0;

        for(var i = 0; i < rows;i++) //rader
        {
            mapArray[i] = [];
            for(var j = 0; j < cols;j++) //kolumner
            {
                if(j === 0 || j === cols-1) //oförstörbara tiles omringar banan. ingen får fly...
                {
                    mapArray[i][j] = 10;
                }

                //Oförstörbara rutor under spelarens startposition. kan väljas bort
                else if(i === rows-1 && startPlatform)
                {
                    mapArray[i][j] = 10; 
                }

                else if(i % 4 === 0) //plattformar ska finnas på var 4:e rad.
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
    }

    return mapArray;
    
}


/**
 * Ritar ut banan, efter den kod som skapas i createMap
 * 
 * @param   context     Där som banan ritas.
 * @param   canvasTop  Skickar nummer som berättar vilken pixel på banan som canvasen är på.
 * 
 */
Map.prototype.renderMap = function(context,canvasTop,canvasLeft)
{

    for (var i = Math.floor(canvasTop / this.tileSize); i < this.rows; i++) //rader
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
                    context.drawImage(this.sprite,0,0,this.tileSize,this.tileSize,j*this.tileSize-canvasLeft,i*this.tileSize-canvasTop,this.tileSize,this.tileSize);
                    break;
                //6-7: rutor som kräver ett slag för att krossas
                case 6:
                case 7:
                    context.drawImage(this.sprite,this.tileSize,0,this.tileSize,this.tileSize,j*this.tileSize-canvasLeft,i*this.tileSize-canvasTop,this.tileSize,this.tileSize);
                    break;
                case 8: //vägg
                    if(this.mapArray[i-1][j])
                    {
                        context.drawImage(this.sprite,0,0,this.tileSize,this.tileSize,j*this.tileSize-canvasLeft,i*this.tileSize-canvasTop,this.tileSize,this.tileSize);
                    }
                    else
                    {
                        context.drawImage(this.sprite,this.tileSize*2,0,this.tileSize,this.tileSize,j*this.tileSize-canvasLeft,i*this.tileSize-canvasTop,this.tileSize,this.tileSize);
                    }
                    break;
                case 9: //oförstörbar
                    context.drawImage(this.sprite,this.tileSize*3,0,this.tileSize,this.tileSize,j*this.tileSize-canvasLeft,i*this.tileSize-canvasTop,this.tileSize,this.tileSize);
                    break;
                case 10:
                    context.drawImage(this.sprite,this.tileSize*3,0,this.tileSize,this.tileSize,j*this.tileSize-canvasLeft,i*this.tileSize-canvasTop,this.tileSize,this.tileSize);
                    break;                    
                default:
                    break;
            }
        }    
    }   
}

Map.prototype.addMoreMap = function(seed, monsters, player, opponent)
{
    //gammal och ny array
    var oldArray = this.mapArray;
    var newArray = this.createMap(seed, false);

    this.rows += 40;

    //slå ihop...
    this.mapArray = newArray.concat(oldArray);

    //uppdaterar spelare och monsters y-position då de inte får flyttas på banan
    player.posY += 40 * this.tileSize; 

    //vid splitscreen ska även motståndaren flyttas när det kommer mer bana.
    if(this.gameMode === "mp2")
    {
        opponent.posY += 40 * this.tileSize; 
    }

    var tileSize = this.tileSize;

    monsters.forEach(function(monster)
    {
        monster.posY += 40 * tileSize;
    });
}