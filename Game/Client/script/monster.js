
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
    
    this.width;
    this.height;
    this.speed;
    
    this.monsterSprite = new Image();
    this.monsterSprite.src="pics/monsterSprite.png";
    
    this.posY = this.floor * 64; //hårdkodat in map.tileSize, som inte fungerar här. Vet inte varför.
    
    if(this.type !== 2) //startposition, inte för fallande stenar 
    {
        //positionering
        this.posX;
        if(this.direction === 0) //vänster - höger
        {
            this.posX = 1;
        }
        else if(this.direction === 1)//höger - vänster
        {
                        //kolla! map.tileSize funkar!
            this.posX = map.tileSize * map.cols - this.width; 
            
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
    this.speed = 6;
    this.width = 30;
    this.height = 40;
}
Bat.prototype = new Monster();

/**
 * funktion som flyttar på fladdermusen och ritar den sedan på banan
 * 
 * @param   context     Där fladdermusen ska ritas
 * @param   canvasTop   y-position för toppen av canvasen, som monstren ska ritas relativt till.
 * @param   canvasLeft  x-position för canvasens vänsterkant, som monstren ska ritas relativt till.
 */
Bat.prototype.renderBat = function(context, canvasTop, canvasLeft)
{
    //vänster-höger
    if(this.direction === 0)
    {
        context.drawImage(this.monsterSprite, (Math.floor(this.currentSprite/2)*this.width)+(this.width*2), 0, this.width, this.height, this.posX-canvasLeft, this.posY - canvasTop, this.width, this.height);
    }
    
    //höger-vänster
    else if(this.direction === 1)
    {      
        context.drawImage(this.monsterSprite, (Math.floor(this.currentSprite/2)*this.width), 0, this.width, this.height, this.posX-canvasLeft, this.posY - canvasTop, this.width, this.height);
    }
    this.currentSprite++;
    if(this.currentSprite > 3){this.currentSprite = 0};//börjar om animationen
}

/**
 * Flyttar på fladdermusen
 *
 */
Bat.prototype.moveBat = function()
{
    if(this.direction === 0)
    {
        this.posX += this.speed;
    }
    else if(this.direction === 1)
    {
        this.posX -= this.speed;
    }
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

    this.height = 50;
    this.width = 40;

    Monster.call(this,type,floor,direction,map);

    
    this.speed = 2;
    
}
Troll.prototype = new Monster();

/**
 * funktion som flyttar på trollet och ritar den sedan på banan
 * 
 * @param   context     Där trollet ska ritas
 * @param   player      Spelare. Trollet jagar spelare som är i närheten.
 * @param   canvasTop   y-position för toppen av canvasen, som monstren ska ritas relativt till.
 * @param   canvasLeft  x-position för canvasens vänsterkant, som monstren ska ritas relativt till.
 */
Troll.prototype.renderTroll = function(context,player, canvasTop, canvasLeft)
{
       
    //vänster-höger
    if(this.direction === 0)
    {
        //hämta rätt sprite
        context.drawImage(this.monsterSprite, (Math.floor(this.currentSprite/2)*this.width)+(this.width*4), 41, this.width, this.height, this.posX-canvasLeft, this.posY - canvasTop, this.width, this.height);
    }
    
    //höger-vänster
    else
    {    
        //hämta rätt sprite
        context.drawImage(this.monsterSprite, Math.floor(this.currentSprite/2)*this.width, 41, this.width, this.height, this.posX-canvasLeft, this.posY - canvasTop, this.width, this.height);
    }
    this.currentSprite++;
    if(this.currentSprite > 7){this.currentSprite = 0};//börjar om animationen

}


/**
 * Flyttar på trollet
 * 
 * @param   player    spelare som trollet eventuellt ska jaga
 * @param   opponent  annan spelare som trollet eventuellt ska jaga
 */
Troll.prototype.moveTroll = function(player, opponent)
{
    //Om ett troll märker att en spelare är på samma level så blir det argt och attackerar.
    if((player.posY <= this.posY+this.height && player.posY >= this.posY - this.map.tileSize * 2 && player.posX > this.posX) || opponent !== undefined && (opponent.posY <= this.posY+this.height && opponent.posY >= this.posY - this.map.tileSize * 2 && opponent.posX > this.posX))
    {
        this.speed = 4;
        
        this.direction = 0;
    }
    else if((player.posY <= this.posY+this.height && player.posY >= this.posY - this.map.tileSize * 2 && player.posX < this.posX) || opponent !== undefined && (opponent.posY <= this.posY+this.height && opponent.posY >= this.posY - this.map.tileSize * 2 && opponent.posX < this.posX))
    {
        this.speed = 4;
        
        this.direction = 1;        
    }
    
    //Troll glad. troll gå lugnt.
    else
    {
        this.speed = 2;    
    }


    //flytta troll
    if(this.direction === 0)
    {
        this.posX += this.speed;
    }
    else if(this.direction ===  1)
    {
        this.posX -= this.speed;
    }

}



/**
 * Konstruktor för fallande stenar. Subclass till Monster
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
    
    this.speed = 0;
    
    this.posX = floor * map.tileSize;
    this.posY = 1;
}

FallingRock.prototype = new Monster();

/**
 * funktion som flyttar på den fallande stenen och ritar den sedan på banan
 * 
 * @param   context     Där stenen ska ritas
 * @param   canvasTop   y-position för toppen av canvasen, som monstren ska ritas relativt till.
 * @param   canvasLeft  x-position för canvasens vänsterkant, som monstren ska ritas relativt till.
 */
FallingRock.prototype.renderFallingRock = function(context, canvasTop, canvasLeft)
{
    //rita på banan
    context.drawImage(this.monsterSprite, 0, 91, this.width, this.height, this.posX - canvasLeft ,this.posY - canvasTop, this.width, this.height);
}


/**
 * Funktion som kollar varje monster och kallar sedan på rätt funktion som flyttar just det monstret
 * 
 * @param   monsters    monstren som ska flyttas
 * @param   player      spelare som troll eventuellt ska jaga
 * @param   opponent    annan spelare som troll eventuellt ska jaga
 */
function moveMonsters(monsters, player, opponent)
{
    monsters.forEach(function(monster)
    {
        if(monster.type === 0)
        {
            monster.moveBat();
        }
        else if(monster.type === 1)
        {
            monster.moveTroll(player, opponent);
        }
    })
}


