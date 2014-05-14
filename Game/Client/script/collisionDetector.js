
/**
 * Konstruktor för objekt som letar efter kollisioner.
 * 
 * @param   map         banan där kollisioner kan inträffa
 * @param   player      spelaren som kan kollidera med monster eller block
 * @param   monsters    array med monster som kan kollidera med spelare eller block
 */
function CollisionDetector(map, player, monsters)
{
    this.map = map;
    this.player = player;
    this.monsters = monsters;
    
}

/**
 * Letar efter kollisioner mellan spelare och block
 */
CollisionDetector.prototype.checkForYCollision = function(jump)
{
    
    //ta reda på vilken ruta i banans tileset som spelaren befinner sig i
    var playerRow = Math.floor(this.player.posY / this.map.tileSize);
    var playerRowB = Math.floor((this.player.posY+this.player.height) / this.map.tileSize);
    var playerColL = Math.floor(this.player.posX / this.map.tileSize);
    var playerColR = Math.floor((this.player.posX+this.player.width) / this.map.tileSize);

    if(jump && (this.map.mapArray[playerRow+1][playerColL] > 0 || this.map.mapArray[playerRow+1][playerColR] > 0 ) && this.player.jumpState === 0)
    {
        
        this.player.direction = 2;         
        this.player.jumpState = this.player.height * 0.9; 

        this.player.posY -= this.player.jumpState;
        this.player.jumpState--;
    }
    else if(this.player.jumpState > 0)
    {

        this.player.posY -= this.player.jumpState;
        this.player.jumpState --;
    }

    playerRow = Math.floor(this.player.posY / this.map.tileSize);
    playerRowB = Math.floor((this.player.posY+this.player.height) / this.map.tileSize);
    playerColL = Math.floor(this.player.posX / this.map.tileSize);
    playerColR = Math.floor((this.player.posX+this.player.width) / this.map.tileSize);


    //gravitation
    this.player.posY += 10;  

    //finns nåt över?
    if(this.map.mapArray[playerRow][playerColL] > 0 || this.map.mapArray[playerRow][playerColR] > 0 && this.player.jumpState > 0)
    {
        this.player.posY = (playerRow + 1) * this.map.tileSize;

    }
 
    //finns nåt under?
    else if((this.map.mapArray[playerRowB][playerColL] > 0 || this.map.mapArray[playerRowB][playerColR] > 0))
    {
        this.player.posY = playerRow * this.map.tileSize + this.map.tileSize - this.player.height;
    }
}


CollisionDetector.prototype.checkForXCollision = function()
{
    //ta reda på vilken ruta i banans tileset som spelaren befinner sig i
    var playerRow = Math.floor(this.player.posY / this.map.tileSize);
    var playerColL = Math.floor(this.player.posX / this.map.tileSize);
    var playerColR = Math.floor((this.player.posX+this.player.width) / this.map.tileSize);

    //Riktning: höger - vänster
    if (this.player.direction === 1)
    {
        if(this.map.mapArray[playerRow][Math.floor((this.player.posX - this.player.runningSpeed) / this.map.tileSize)] === 0)
        {
            this.player.posX -= this.player.runningSpeed;
        }
        else
        {
            this.player.posX = playerColL * this.map.tileSize;
        }
    }

    //Riktning: vänster - höger
    if(this.player.direction === 0)
    {
        if(this.map.mapArray[playerRow][Math.floor((this.player.posX + this.player.width + this.player.runningSpeed) / this.map.tileSize)] === 0)
        {
            this.player.posX += this.player.runningSpeed;  
        }
        else
        {
            this.player.posX = playerColL * this.map.tileSize + (this.map.tileSize - this.player.width-1);             
        }
    }


}

/**
 * Letar efter kollisioner mellan monster och block. kollar varje monster för sig
 */
CollisionDetector.prototype.detectMonsterWallCollision = function()
{
    var map = this.map;
    var monsters = this.monsters;
    
    var monsterRow;
    var monsterColL;
    var monsterColR;
    
    var monsterIndex = 0; 
    this.monsters.forEach(function(monster)
    {
        if(monster.type !== 0)
        {
            monster.posY += 10;
        }

        monsterRow = Math.floor(monster.posY / map.tileSize);
        monsterColL = Math.floor(monster.posX / map.tileSize);
        monsterColR = Math.floor((monster.posX+monster.width) / map.tileSize);    

        //om ett monster går utanför banan
        if(monster.posX < 0 || monster.posX + monster.width > map.tileSize*map.cols || monster.posY < 0 || monster.posY+monster.height > map.tileSize * map.rows)
        {
            monsters.splice(monsterIndex,1); // tar bort monster från array
            monster = null; //låter garbage collectorn äta upp monstret
        }
        
        
        else
        {
            //om monstret går in i en vägg
            if ((map.mapArray[monsterRow][monsterColR] > 0 && map.mapArray[monsterRow][monsterColR] < 10) || (map.mapArray[monsterRow][monsterColL] > 0 && map.mapArray[monsterRow][monsterColL] < 10)  )
            {
                //monster vänder om de stöter på en vägg
                if(monster.direction === 0)
                {
                    monster.posX -= monster.speed;
                    monster.direction = 1;
                }
                else if(monster.direction === 1)
                {
                    monster.posX += monster.speed;
                    monster.direction = 0;
                }
            }
            
            
            if(map.rows > monsterRow+1)
            {
                //finns nåt under? troll kan gå på sånt. Troll kan också gå rakt fram i en oförstörbar vägg, även om det inte finns nåt under.
                if(monster.type === 1 && ((map.mapArray[monsterRow+1][monsterColL] > 0 || map.mapArray[monsterRow+1][monsterColR] > 0) ||(monster.direction === 0 && map.mapArray[monsterRow][monsterColR] === 10) || (monster.direction === 1 && map.mapArray[monsterRow][monsterColL] === 10)))
                {
                    monster.posY = monsterRow * map.tileSize + map.tileSize - monster.height;
                }
                
                //stenblock kan inte gå så bra men dom studsar upp lite om de stöter på ett hinder
                else if(monster.type === 2 && monster.bounceState === 0 && ((map.mapArray[monsterRow+1][monsterColL] > 0 && map.mapArray[monsterRow+1][monsterColL] < 10) || (map.mapArray[monsterRow+1][monsterColR] > 0 && map.mapArray[monsterRow+1][monsterColR] < 10))  )    
                {
                    monster.bounceState = 15;
                }

            }
    
        }
        monsterIndex++;
        
        
    });
}
/**
 * Letar efter kollisioner mellan monster och spelare. Kollar varje monster för sig.
 */
CollisionDetector.prototype.detectMonsterCollision = function()
{
    var player = this.player;
    
    //kollar varje monster för sig
    this.monsters.forEach(function(monster)
    {
        if(
            ((player.posX >= monster.posX && player.posX <= monster.posX+monster.width) || (player.posX + player.width >= monster.posX && player.posX + player.width <= monster.posX+monster.width)) &&
            ((player.posY >= monster.posY && player.posY <= monster.posY+monster.height) || (player.posY + player.height >= monster.posY && player.posY + player.height <= monster.posY+monster.height))
        )
        {
            player.isDead = true; //spelaren dör.
        }
        
    })
    
}



/**
 * Anropas när spelaren slår. Kollar ifall någor block eller fiende har träffats av slaget.
 * 
 * @param   map         Banan som spelaren slår sönder block på
 * @param   monsters    Array med alla monster. Behövs för att se om någon blev slagen.
 */
CollisionDetector.prototype.hitting = function()
{

    //när ett block träffas så byts de ut i denna lilla funktion
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

    var monsters = this.monsters;
    var map = this.map;
    var player = this.player;
    var reach = 60;//hur långt spelaren når med sitt vapen

    //ta reda på vilken ruta i banans tileset som spelaren befinner sig i
    var playerRow = Math.floor(player.posY / map.tileSize);
    var playerColL = Math.floor(player.posX / map.tileSize);
    var playerColR = Math.floor((player.posX+player.width) / map.tileSize);    
    

    
    var monsterIndex = 0;
    
    if(player.direction === 0) //slag åt höger
    {
        //slog spelaren ett monster?
        monsters.forEach(function(monster)
        {
            //kollar om något monster är inom räckhåll för att bli ihjälslagen
            if(monster.posY >= player.posY && monster.posY <= player.posY+player.height && monster.posX >= player.posX && monster.posX <= player.posX + player.width + reach )
            {
                alert()
                monsters.splice(monsterIndex,1); // tar bort monster från array
                monster = null;
            }
            monsterIndex++;
        })
        //nån vägg att slå sönder?
        map.mapArray[playerRow][Math.floor((player.posX+player.width+reach) / map.tileSize)] = changeBlock(map.mapArray[playerRow][Math.floor((player.posX+player.width+reach) / map.tileSize)]);
    }
    
    else if(player.direction === 1 ) //slag åt vänster
    {
        //slog spelaren ett monster?
        monsters.forEach(function(monster)
        {
            //kollar om något monster är inom räckhåll för att bli ihjälslagen
            if(monster.posY >= player.posY && monster.posY <= player.posY+player.height && monster.posX <= player.posX && monster.posX >= player.posX - reach )
            {
                monsters.splice(monsterIndex,1); // tar bort monster från array
                monsters = null;
            }
            monsterIndex++;
        })
        map.mapArray[playerRow][Math.floor((player.posX - reach) / map.tileSize)] = changeBlock(map.mapArray[playerRow][Math.floor((player.posX - reach) / map.tileSize)]);
    }
    
    if(player.jumpState > 0)//slag upp
    {
        alert(map.mapArray);
        alert(Math.floor((player.posY - reach) / map.tileSize));
        Math.floor((player.posX + player.width/2) / map.tileSize);

        map.mapArray[Math.floor((player.posY - reach) / map.tileSize)][Math.floor((player.posX + player.width/2) / map.tileSize)] = changeBlock(map.mapArray[Math.floor((player.posY - reach) / map.tileSize)][Math.floor((player.posX + player.width/2) / map.tileSize)]);

    }    
}
