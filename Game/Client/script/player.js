/**
 *  Konstruktor för Player-objektet
 * 
 * @param   posX    horisontell position
 * @param   posY    vertikal position
 */
function Player(posX, posY)
{

    //position
    this.posX = posX;
    this.posY = posY;
    
    this.direction = 0;
    
    //sidlängd i pixlar
    this.side = 40;
    
    //hastighet (vertikal)
    this.ySpeed = 0;
    
    this.runningSpeed = 5;
    
    //mitt i ett hopp?
    this.jumpState = 0;
    
    //slag
    this.hitState = 0;
    

    
}

/**
 * Ritar spelaren.
 * 
 * @param   context     Där som spelaren ritas  
 */
//rita spelare
Player.prototype.renderPlayer = function(context)
{   
    context.fillStyle = "#0000FF";
    context.fillRect(this.posX,this.posY, this.side,this.side)
};

/**
 * Anropas när spelaren slår. Kollar ifall någor block eller fiende har träffats av slaget.
 * 
 * @param   map         Banan som spelaren slår sönder block på
 * @param   monsters    Array med alla monster. Behövs för att se om någon blev slagen.
 */
Player.prototype.hitting = function(map,monsters)
{

    //ta reda på vilken ruta i banans tileset som spelaren befinner sig i
    var playerRow = Math.floor(this.posY / map.tileSize);
    var playerColL = Math.floor(this.posX / map.tileSize);
    var playerColR = Math.floor((this.posX+this.side) / map.tileSize);    
    
    var player = this;
    var reach = 60;//hur långt spelaren når med sitt vapen
    
    var monsterIndex = 0;
    
    if(this.direction === 0) //slag åt höger
    {
        //slog spelaren ett monster?
        monsters.forEach(function(monster)
        {
            //kollar om något monster är inom räckhåll för att bli ihjälslagen
            if(monster.posY >= player.posY && monster.posY <= player.posY+player.side && monster.posX >= player.posX && monster.posX <= player.posX + player.side + reach )
            {
                monsters.splice(monsterIndex,1); // tar bort monster från array
                monster = null;
            }
            monsterIndex++;
        })
        //nån vägg att slå sönder?
        map.mapArray[playerRow][Math.floor((this.posX+this.side+reach) / map.tileSize)] = changeBlock(map.mapArray[playerRow][Math.floor((this.posX+this.side+reach) / map.tileSize)]);
    }
    
    else if(this.direction === 1 ) //slag åt vänster
    {
        //slog spelaren ett monster?
        monsters.forEach(function(monster)
        {
            //kollar om något monster är inom räckhåll för att bli ihjälslagen
            if(monster.posY >= player.posY && monster.posY <= player.posY+player.side && monster.posX <= player.posX && monster.posX >= player.posX - reach )
            {
                monsters.splice(monsterIndex,1); // tar bort monster från array
                monsters = null;
            }
            monsterIndex++;
        })
        map.mapArray[playerRow][Math.floor((this.posX - reach) / map.tileSize)] = changeBlock(map.mapArray[playerRow][Math.floor((this.posX - reach) / map.tileSize)]);
    }
    
    else if(this.direction === 2)//slag upp
    {
        map.mapArray[Math.floor((this.posY - reach) / map.tileSize)][playerColL] = changeBlock(map.mapArray[Math.floor((this.posY - reach) / map.tileSize)][playerColL]);

    }    
}

/**
 * Om ett block blivit träffat så bestämmer denna funktion vad som ska hända med det.
 * 
 * @param   hitBlock    Blocket som träffades av ett slag och ska kollas av funktionen
 * @return  blockets nya typ.
 */
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
        case 10:
            return 10;
            
    }
}
