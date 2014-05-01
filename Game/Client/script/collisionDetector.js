function detectCollision(player,map)
{
    //ta reda på vilken ruta i banans tileset som spelaren befinner sig i
    var playerRow = Math.floor(player.posY / map.tileSize);
    var playerColL = Math.floor(player.posX / map.tileSize);
    var playerColR = Math.floor((player.posX+player.side) / map.tileSize);

    //finns nåt över?
    if(map.mapArray[playerRow][playerColL] > 0 || map.mapArray[playerRow][playerColR] > 0)
    {
        player.posY = (playerRow + 1) * map.tileSize;
    }
    
    //finns nåt under?
    if((map.mapArray[playerRow+1][playerColL] > 0 || map.mapArray[playerRow+1][playerColR] > 0) && player.ySpeed >= 0)
    {
        player.posY = playerRow * map.tileSize + map.tileSize - player.side;
    }

    
    playerRow = Math.floor(player.posY / map.tileSize);
    playerColL = Math.floor(player.posX / map.tileSize);
    playerColR = Math.floor((player.posX+player.side) / map.tileSize);      
    
    
    if(player.xSpeed !== 0)
    {
        
        //finns nåt till höger?
        if(map.mapArray[playerRow][playerColR] > 0 && player.xSpeed > 0)
        {
            console.log("höger")
            player.posX = playerColL * map.tileSize + (map.tileSize - player.side);
            player.posX--;
        }
        
        //finns nåt till vänster?
        if(map.mapArray[playerRow][playerColL] > 0 && player.xSpeed < 0)
        {
            console.log("vänster")
            player.xSpeed = 0;
            player.posX = (playerColL+1) * map.tileSize;
            
        }
    }


}