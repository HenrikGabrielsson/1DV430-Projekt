
/**
 * Konstruktor för Monster. De olika monstren ärver härifrån och anropas av andra konstruktorer.
 * 
 * @param   type        innehåller siffra som identiferar monstrets typ, 0 = bat, 1 = troll, 2 = falling rock
 * @param   floor       bestämmer vart fienden ska starta.
 * @param   direction   riktning som monstret  börjar att färdas i.
 * @param   map         banan där monstren ska vandra.
 */
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
    
    this.posY = this.floor * 64; //this.floor * map.tileSize men det fungerar inte just här. anledning: javascript
    
    if(this.type !== 2) //startposition, inte för fallande stenar 
    {
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
    }
    
    
}



/**
 * Konstruktor för fladdermöss. Subclass till Monster
 * 
 * @param   type        innehåller siffra som identiferar monstrets typ, 0 = bat, 1 = troll, 2 = falling rock
 * @param   floor       bestämmer vart fienden ska starta.
 * @param   direction   riktning som monstret  börjar att färdas i.
 * @param   map         banan där monstren ska vandra.
 */

//Fladdermus-konstruktor
function Bat(type,floor,direction, map)
{
    Monster.call(this,type,floor,direction,map);
    this.speed = 7;
    this.width = 16;
    this.height = 10;
}
Bat.prototype = new Monster();

/**
 * funktion som flyttar på fladdermusen och ritar den sedan på banan
 * 
 * @param   context     Där fladdermusen ska ritas
 */
Bat.prototype.renderBat = function(context, canvasTop, canvasLeft)
{
    
    //vänster-höger
    if(this.direction === 0)
    {
        this.posX += this.speed;
        context.drawImage(this.monsterSprites, (this.currentSprite*this.width)+(this.width*2), 24, this.width, this.height, this.posX-canvasLeft, this.posY - canvasTop, this.width, this.height);
    }
    
    //höger-vänster
    else
    {
        this.posX -= this.speed;
        context.drawImage(this.monsterSprites, (this.currentSprite*this.width), 24, this.width, this.height, this.posX-canvasLeft, this.posY - canvasTop, this.width, this.height);
    }
    this.currentSprite++;
    if(this.currentSprite > 1){this.currentSprite = 0};//börjar om animationen
}









/**
 * Konstruktor för troll. Subclass till Monster
 * 
 * @param   type        innehåller siffra som identiferar monstrets typ, 0 = bat, 1 = troll, 2 = falling rock
 * @param   floor       bestämmer vart fienden ska starta.
 * @param   direction   riktning som monstret  börjar att färdas i.
 * @param   map         banan där monstren ska vandra.
 */
function Troll(type,floor,direction,map)
{
    Monster.call(this,type,floor,direction,map);
    this.height = 24;
    this.width = 19;
    
    this.speed = 2;
    
}
Troll.prototype = new Monster();

/**
 * funktion som flyttar på trollet och ritar den sedan på banan
 * 
 * @param   context     Där trollet ska ritas
 * @param   player      Spelare. Trollet jagar spelare som är i närheten.
 */
Troll.prototype.renderTroll = function(context,player, canvasTop, canvasLeft)
{
    this.posY += 10; //gravitation
    
    //Om ett troll märker att en spelare är på samma level så blir det argt.
    if(player.posY <= this.posY && player.posY >= this.posY - this.map.tileSize * 3 && player.posX > this.posX)
    {
        this.speed = 4;
        
        this.direction = 0;
    }
    else if(player.posY <= this.posY && player.posY >= this.posY - this.map.tileSize * 3 && player.posX < this.posX)
    {
        this.speed = 4;
        
        this.direction = 1;        
    }
    
    else
    {
        this.speed = 2;    
    }
   
    //vänster-höger
    if(this.direction === 0)
    {
    
        this.posX += this.speed;

        //hämta rätt sprite
        context.drawImage(this.monsterSprites, (this.currentSprite*this.width)+(this.width*4), 0, this.width, this.height, this.posX-canvasLeft, this.posY - canvasTop, this.width, this.height);
        
    }
    
    //höger-vänster
    else
    {
        this.posX -= this.speed;
        
        //hämta rätt sprite
        context.drawImage(this.monsterSprites, this.currentSprite*this.width, 0, this.width, this.height, this.posX-canvasLeft, this.posY - canvasTop, this.width, this.height);
        
    }
    this.currentSprite++;
    if(this.currentSprite > 3){this.currentSprite = 0};//börjar om animationen

}






/**
 * Konstruktor för stenar. Subclass till Monster
 * 
 * @param   type        innehåller siffra som identiferar monstrets typ, 0 = bat, 1 = troll, 2 = falling rock
 * @param   floor       bestämmer vart fienden ska starta.
 * @param   direction   riktning som monstret  börjar att färdas i.
 * @param   map         banan där monstren ska vandra.
 */
function FallingRock(type,floor,direction,map)
{
    Monster.call(this,type,floor,direction,map);
    this.width = 60;
    this.height = 60;
    
    this.bounceState = 0;
    
    this.speed = 0;
    
    this.posX = Math.floor(floor/2 * map.tileSize);
    this.posY = 1;
}
FallingRock.prototype = new Monster();

/**
 * funktion som flyttar på den fallande stenen och ritar den sedan på banan
 * 
 * @param   context     Där stenen ska ritas
 */
FallingRock.prototype.renderFallingRock = function(context, canvasTop, canvasLeft)
{
    this.posY += 10 - this.bounceState; //gravitation


    if(this.bounceState > 0)
    {
        this.bounceState--;
    }

    //rita på banan
    context.fillStyle = "#0000FF";
    context.fillRect(this.posX-canvasLeft, this.posY - canvasTop, this.width, this.height);
}







