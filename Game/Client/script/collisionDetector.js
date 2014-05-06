
//konstruktor
function CollisionDetector(map, player, monsters)
{
    this.map = map;
    this.player = player;
    this.monsters = monsters;
    
}

//kollar efter kollisioner spelare/block
CollisionDetector.prototype.detectWallCollision = function()
{
    //ta reda på vilken ruta i banans tileset som spelaren befinner sig i
    var playerRow = Math.floor(this.player.posY / this.map.tileSize);
    var playerColL = Math.floor(this.player.posX / this.map.tileSize);
    var playerColR = Math.floor((this.player.posX+this.player.side) / this.map.tileSize);

    //finns nåt över?
    if(this.map.mapArray[playerRow][playerColL] > 0 || this.map.mapArray[playerRow][playerColR] > 0)
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
    
    
    if(this.player.xSpeed !== 0)
    {
        
        //finns nåt till höger?
        if(this.map.mapArray[playerRow][playerColR] > 0 && this.player.xSpeed > 0)
        {
            console.log("höger");
            this.player.posX = playerColL * this.map.tileSize + (this.map.tileSize - this.player.side);
            this.player.posX--;
        }
        
        //finns nåt till vänster?
        if(this.map.mapArray[playerRow][playerColL] > 0 && this.player.xSpeed < 0)
        {
            console.log("vänster")
            this.player.xSpeed = 0;
            this.player.posX = (playerColL+1) * this.map.tileSize;
            
        }
    }
}

//letar efter kollisioner mellan block/monster
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
    
        //gravitation
        if(monster.type === 1 || monster.type === 2 )
        {
            monster.posY += 10;
        }
        
        //om ett monster går utanför banan
        if(monsterColL < 0 || monsterColR > map.cols - 1)
        {
            monsters.splice(monsterIndex,1); // tar bort monster från array
            monster = null; //låter garbage collectorn äta upp monstret
        }
        
        
        else
        {
            //krock med vägg (direction = vänster-höger)
            if (monster.direction === 0 && map.mapArray[monsterRow][monsterColR] > 0 && map.mapArray[monsterRow][monsterColR] < 10 )
            {
                
                //monster vänder om de stöter på en vägg
                if(monster.direction === 0)
                {
                    monster.direction = 1;
                }
                else if(monster.direction === 1)
                {
                    monster.direction = 0;
                }
            }
            
            //krock med vägg (direction = höger-vänster)
            if(monster.direction === 1 && map.mapArray[monsterRow][monsterColL] > 0 && map.mapArray[monsterRow][monsterColL] < 10 )
            {
                
                //monster vänder om de stöter på en vägg
                if(monster.direction === 0)
                {
                    monster.direction = 1;
                }
                else if(monster.direction === 1)
                {
                    monster.direction = 0;
                }
            }
            
            
            //finns nåt under?
            if((map.mapArray[monsterRow+1][monsterColL] > 0 || map.mapArray[monsterRow+1][monsterColR] > 0) )
            {
                monster.posY = monsterRow * map.tileSize + map.tileSize - monster.height;
            }
            
            //monster ska kunna gå igenom oförstörbara väggar utan att falla om det inte finns nåt under
            else if((monster.direction === 0 && map.mapArray[monsterRow][monsterColR] === 10) || (monster.direction === 1 && map.mapArray[monsterRow][monsterColL] === 10)) 
            {
                monster.posY = monsterRow * map.tileSize + map.tileSize - monster.height;
            }
        }    
        monsterIndex++;
        
        
    });
}

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






