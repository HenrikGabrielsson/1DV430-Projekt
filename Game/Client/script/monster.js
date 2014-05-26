
/**
 * Konstruktor f�r Monster. De olika monstren �rver h�rifr�n och anropas av andra konstruktorer.
 * 
 * @param   type        inneh�ller siffra som identiferar monstrets typ, 0 = bat, 1 = troll, 2 = falling rock
 * @param   floor       best�mmer vart fienden ska starta.
 * @param   direction   riktning som monstret  b�rjar att f�rdas i.
 * @param   map         banan d�r monstren ska vandra.
 */
function Monster(type,floor,direction,map)
{
    this.type = type;
    this.floor = floor;
    this.direction = direction;
    
    this.currentSprite = 0;
    
    this.map = map;
    
    this.width;
    this.height;
    this.speed;
    
    this.monsterSprite = new Image();
    this.monsterSprite.src="pics/monsterSprite.png";
    
    this.posY = this.floor * 64; //this.floor * map.tileSize men det fungerar inte just h�r. anledning: javascript
    
    if(this.type !== 2) //startposition, inte för fallande stenar 
    {
        //positionering
        this.posX;
        if(this.direction === 0) //v�nster - h�ger
        {
            this.posX = 1;
        }
        else if(this.direction === 1)//h�ger - v�nster 
        {
            this.posX = map.tileSize * map.cols - this.width; 
            
        }
    }
    
    
}



/**
 * Konstruktor f�r fladderm�ss. Subclass till Monster
 * 
 * @param   type        inneh�ller siffra som identiferar monstrets typ, 0 = bat, 1 = troll, 2 = falling rock
 * @param   floor       best�mmer vart fienden ska starta.
 * @param   direction   riktning som monstret  b�rjar att f�rdas i.
 * @param   map         banan d�r monstren ska vandra.
 */

//Fladdermus-konstruktor
function Bat(type,floor,direction, map)
{
    Monster.call(this,type,floor,direction,map);
    this.speed = 6;
    this.width = 30;
    this.height = 40;
}
Bat.prototype = new Monster();

/**
 * funktion som flyttar p� fladdermusen och ritar den sedan p� banan
 * 
 * @param   context     D�r fladdermusen ska ritas
 */
Bat.prototype.renderBat = function(context, canvasTop, canvasLeft)
{
    //v�nster-h�ger
    if(this.direction === 0)
    {
        this.posX += this.speed;
        context.drawImage(this.monsterSprite, (Math.floor(this.currentSprite/2)*this.width)+(this.width*2), 0, this.width, this.height, this.posX-canvasLeft, this.posY - canvasTop, this.width, this.height);
    }
    
    //h�ger-v�nster
    else if(this.direction === 1)
    {
        this.posX -= this.speed;
        context.drawImage(this.monsterSprite, (Math.floor(this.currentSprite/2)*this.width), 0, this.width, this.height, this.posX-canvasLeft, this.posY - canvasTop, this.width, this.height);
    }
    this.currentSprite++;
    if(this.currentSprite > 3){this.currentSprite = 0};//b�rjar om animationen
}



/**
 * Konstruktor f�r troll. Subclass till Monster
 * 
 * @param   type        inneh�ller siffra som identiferar monstrets typ, 0 = bat, 1 = troll, 2 = falling rock
 * @param   floor       best�mmer vart fienden ska starta.
 * @param   direction   riktning som monstret  b�rjar att f�rdas i.
 * @param   map         banan d�r monstren ska vandra.
 */
function Troll(type,floor,direction,map)
{

    this.height = 50;
    this.width = 40;

    Monster.call(this,type,floor,direction,map);

    
    this.speed = 2;
    
}
Troll.prototype = new Monster();

/**
 * funktion som flyttar p� trollet och ritar den sedan p� banan
 * 
 * @param   context     D�r trollet ska ritas
 * @param   player      Spelare. Trollet jagar spelare som �r i n�rheten.
 */
Troll.prototype.renderTroll = function(context,player, canvasTop, canvasLeft)
{
    
    //Om ett troll m�rker att en spelare �r på samma level s� blir det argt och attackerar.
    if(player.posY <= this.posY+this.height && player.posY >= this.posY - this.map.tileSize * 2 && player.posX > this.posX)
    {
        this.speed = 4;
        
        this.direction = 0;
    }
    else if(player.posY <= this.posY+this.height && player.posY >= this.posY - this.map.tileSize * 2 && player.posX < this.posX)
    {
        this.speed = 4;
        
        this.direction = 1;        
    }
    
    else
    {
        this.speed = 2;    
    }
   
    //v�nster-h�ger
    if(this.direction === 0)
    {
    
        this.posX += this.speed;

        //h�mta r�tt sprite
        context.drawImage(this.monsterSprite, (Math.floor(this.currentSprite/2)*this.width)+(this.width*4), 41, this.width, this.height, this.posX-canvasLeft, this.posY - canvasTop, this.width, this.height);
    }
    
    //h�ger-v�nster
    else
    {
        this.posX -= this.speed;
        
        //h�mta r�tt sprite
        context.drawImage(this.monsterSprite, Math.floor(this.currentSprite/2)*this.width, 41, this.width, this.height, this.posX-canvasLeft, this.posY - canvasTop, this.width, this.height);

    }
    this.currentSprite++;
    if(this.currentSprite > 7){this.currentSprite = 0};//b�rjar om animationen

}



/**
 * Konstruktor f�r stenar. Subclass till Monster
 * 
 * @param   type        inneh�ller siffra som identiferar monstrets typ, 0 = bat, 1 = troll, 2 = falling rock
 * @param   floor       best�mmer vart fienden ska starta.
 * @param   direction   riktning som monstret  b�rjar att f�rdas i.
 * @param   map         banan d�r monstren ska vandra.
 */
function FallingRock(type,floor,direction,map)
{
    Monster.call(this,type,floor,direction,map);
    this.width = 60;
    this.height = 60;
    
    this.speed = 0;
    
    this.posX = floor * map.tileSize;
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
    //rita på banan
    context.drawImage(this.monsterSprite, 0, 91, this.width, this.height, this.posX - canvasLeft ,this.posY - canvasTop, this.width, this.height);
}







