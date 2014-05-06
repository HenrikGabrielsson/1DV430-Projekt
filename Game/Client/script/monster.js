
//Monster-konstruktor
function Monster(type,floor,direction,map)
{
    this.type = type;
    this.floor = floor;
    this.direction = direction;
    
    this.currentSprite = 0;
    
    this.map = map;
    
    this.width = 20;
    this.height = 20;
    this.speed;
    
    this.monsterSprites = new Image();
    this.monsterSprites.src="pics/monsterTileSet5.png";
    
    
    //positionering
    this.posX;
    if(this.direction === 0) //vänster - höger
    {
        this.posX = map.tileSize;
    }
    else if(this.direction === 1)//höger - vänster 
    {
        this.posX = map.tileSize * map.cols - (this.width+1); 
    }
    
    this.posY = floor * 40;
    
}

//rita monstret på banan
Monster.prototype.renderMonster = function(context, player)
{

    //rita på banan
    context.fillStyle = "#FF0000";
    context.fillRect(this.posX, this.posY, this.width, this.height);
    
    
    //uppdatera monstrets position
    if(this.direction === 0)
    {
        this.posX += this.speed;
    }
    else
    {
        this.posX -= this.speed;
    }
    
    
}






//Fladdermus-konstruktor
function Bat(type,floor,direction, map)
{
    Monster.call(this,type,floor,direction,map);
    this.speed = 7;
    this.width = 16;
    this.height = 10;
}

Bat.prototype = new Monster();

Bat.prototype.renderBat = function(context)
{
    //vänster-höger
    if(this.direction === 0)
    {
        this.posX += this.speed;
        context.drawImage(this.monsterSprites, (this.currentSprite*this.width)+(this.width*2), 24, this.width, this.height, this.posX, this.posY, this.width, this.height);
    }
    
    //höger-vänster
    else
    {
        this.posX -= this.speed;
        context.drawImage(this.monsterSprites, (this.currentSprite*this.width), 24, this.width, this.height, this.posX, this.posY, this.width, this.height);
    }
    this.currentSprite++;
    if(this.currentSprite > 1){this.currentSprite = 0};//börjar om animationen
}









//Troll-konstruktor
function Troll(type,floor,direction,map)
{
    Monster.call(this,type,floor,direction,map);
    this.height = 24;
    this.width = 19;
    
    this.speed = 3;
    
}
Troll.prototype = new Monster();

Troll.prototype.renderTroll = function(context,player)
{
    var discoverPlayer = false;
    
    //Om ett troll märker att en spelare är på samma level så blir det argt.
    if(player.posY <= this.posY && player.posY >= this.posY - this.map.tileSize * 3 && player.posX > this.posX)
    {
        discoverPlayer = true;
        this.speed = this.speed * 2;
        
        this.direction = 0;
    }
    else if(player.posY <= this.posY && player.posY >= this.posY - this.map.tileSize * 3 && player.posX < this.posX)
    {
        discoverPlayer = true;
        this.speed = this.speed * 2;
        
        this.direction = 1;        
    }
   
    //vänster-höger
    if(this.direction === 0)
    {
    
        this.posX += this.speed;

        //hämta rätt sprite
        context.drawImage(this.monsterSprites, (this.currentSprite*this.width)+(this.width*4), 0, this.width, this.height, this.posX, this.posY, this.width, this.height);
        
    }
    
    //höger-vänster
    else
    {
        this.posX -= this.speed;
        
        //hämta rätt sprite
        context.drawImage(this.monsterSprites, this.currentSprite*this.width, 0, this.width, this.height, this.posX, this.posY, this.width, this.height);
        
    }
    this.currentSprite++;
    if(this.currentSprite > 3){this.currentSprite = 0};//börjar om animationen

    //återställer hastigheten
    if(discoverPlayer)
    {
        this.speed = this.speed / 2;
    }
    
}









//Sandworm
function Sandworm(type,floor,direction,map)
{
    Monster.call(this,type,floor,direction,map);
    this.speed = 5;
}
Sandworm.prototype = new Monster();



