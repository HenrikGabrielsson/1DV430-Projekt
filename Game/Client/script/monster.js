
//Monster-konstruktor
function Monster(type,floor,direction,map)
{
    this.type = type;
    this.floor = floor;
    this.direction = direction;
    this.width = 20;
    this.height = 20;
    
    //positionering
    this.posX;
    if(this.direction === 0)
    {
        this.posX = 0;
    }
    else
    {
        this.posX = 40 * 40; 
    }
    this.posY = floor * 40;
    
}

//rita monstret på banan
Monster.prototype.renderMonster = function(context)
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
    Monster.call(this,type,floor,direction);
    this.speed = 5;
    
}
Bat.prototype = new Monster();


//Troll-konstruktor
function Troll(type,floor,direction,map)
{
    Monster.call(this,type,floor,direction);
    this.speed = 1;
    
}
Troll.prototype = new Monster();


//Sandworm
function Sandworm(type,floor,direction,map)
{
    Monster.call(this,type,floor,direction);
    this.speed = 3;
}
Sandworm.prototype = new Monster();



