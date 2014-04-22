//konstruktor, tar emot kontroller
function Player(posX, posY)
{

    this.posX = posX;
    this.posY = posY;
    
    
}

//rita spelare
Player.prototype.renderPlayer = function(context)
{   
    context.fillStyle = "#0000FF";
    context.fillRect(this.posX,this.posY, 20,20)
};

//funktioner för att förflytta spelaren
Player.prototype.moveLeft = function()
{
    this.posX += -1;
};

Player.prototype.moveRight = function()
{
    this.posX += 1;
};

Player.prototype.jump = function()
{
    this.posY += -20;
};

Player.prototype.fall = function()
{
    this.posY += 10;
};




