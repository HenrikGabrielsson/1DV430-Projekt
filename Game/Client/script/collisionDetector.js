
//konstruktor
function CollisionDetector(map, player, monsters)
{
    this.map = map;
    this.player = player;
    this.monsters = monsters;
    
}


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

CollisionDetector.prototype.detectMonsterCollision = function()
{
    var player = this.player;
    
    this.monsters.forEach(function(monster)
    {
        if(
            ((player.posX > monster.posX && player.posX < monster.posX+monster.width) || (player.posX + player.side > monster.posX && player.posX + player.side < monster.posX+monster.width)) &&
            ((player.posY > monster.posY && player.posY < monster.posY+monster.height) || (player.posY + player.side > monster.posY && player.posY + player.side < monster.posY+monster.height))
        )
        {
            alert("You're DEAD, FUCKAAAAAH!");
        }
        
    })
    
}






