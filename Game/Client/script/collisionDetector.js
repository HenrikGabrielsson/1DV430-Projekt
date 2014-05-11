
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
CollisionDetector.prototype.detectWallCollision = function()
{


    //ta reda på vilken ruta i banans tileset som spelaren befinner sig i
    var playerRow = Math.floor(this.player.posY / this.map.tileSize);
    var playerColL = Math.floor(this.player.posX / this.map.tileSize);
    var playerColR = Math.floor((this.player.posX+this.player.side) / this.map.tileSize);

    //finns nåt över?
    if(this.map.mapArray[playerRow][playerColL] > 0 || this.map.mapArray[playerRow][playerColR] > 0 && this.player.jumpState > 0)
    {
        this.player.posY = (playerRow + 1) * this.map.tileSize;

    }
    
    //finns nåt under?
    if((this.map.mapArray[playerRow+1][playerColL] > 0 || this.map.mapArray[playerRow+1][playerColR] > 0) && this.player.ySpeed >= 0)
    {
        
        this.player.posY = playerRow * this.map.tileSize + this.map.tileSize - this.player.side;
    }



    playerRow = Math.floor(this.player.posY / this.map.tileSize);
    playerColL = Math.floor(this.player.posX / this.map.tileSize);
    playerColR = Math.floor((this.player.posX+this.player.side) / this.map.tileSize);      
    

    //finns nåt till höger?
    if(this.map.mapArray[playerRow][playerColR] > 0 && this.player.direction === 0)
    {
        this.player.posX = playerColL * this.map.tileSize + (this.map.tileSize - this.player.side);
        this.player.posX--;
    }
    
    //finns nåt till vänster?
    if(this.map.mapArray[playerRow][playerColL] > 0 && this.player.direction === 1)
    {
        this.player.posX = (playerColL+1) * this.map.tileSize;
        
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
//letar efter kollisioner mellan spelare och monster
CollisionDetector.prototype.detectMonsterCollision = function()
{
    var player = this.player;
    var isDead = false;
    
    //kollar varje monster för sig
    this.monsters.forEach(function(monster)
    {
        if(
            ((player.posX >= monster.posX && player.posX <= monster.posX+monster.width) || (player.posX + player.side >= monster.posX && player.posX + player.side <= monster.posX+monster.width)) &&
            ((player.posY >= monster.posY && player.posY <= monster.posY+monster.height) || (player.posY + player.side >= monster.posY && player.posY + player.side <= monster.posY+monster.height))
        )
        {
            isDead = true;
        }
        
        
    })
     return isDead;
    
}