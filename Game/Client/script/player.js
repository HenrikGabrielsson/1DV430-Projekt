//konstruktor, tar emot startposition
function Player(posX, posY)
{

    //position
    this.posX = posX;
    this.posY = posY;
    
    
    
    //hastighet (horisontell och vertikal)
    this.xSpeed = 0;
    this.ySpeed = 0;
    
    //mitt i ett hopp?
    this.jumpState = 0;
    
}

//rita spelare
Player.prototype.renderPlayer = function(context)
{   
    context.fillStyle = "#0000FF";
    context.fillRect(this.posX,this.posY, 20,20)
};

//funktioner för att förflytta spelaren
Player.prototype.moveX = function()
{
    this.posX += this.xSpeed;
};


Player.prototype.moveY = function()
{
    
    this.posY += this.ySpeed;
};






