/**
 *  Konstruktor för Player-objektet
 * 
 * @param   posX    horisontell position
 * @param   posY    vertikal position
 */
function Player(posX, posY)
{

    //position
    this.posX = posX;
    this.posY = posY;
    
    this.direction = 0;
    //0 = vänster-höger
    //1 = höger-vänster
    //2 = uppåt
    
    //sidlängd i pixlar
    this.height = 40;
    this.width = 22;
    
    this.runningSpeed = 5;
    
    //mitt i ett hopp?
    this.jumpState = 0;
    
    //slag
    this.hitState = 0;

    //Om denna är sann så är spelaren död...
    this.isDead = false;
    
    //this.playerSprite = new Image();
    //this.playerSprite.src = "pics/playerSprite.png";
    this.player = new Image();
    this.player.src = "pics/player.png";

    
}

/**
 * Ritar spelaren.
 * 
 * @param   context     Där som spelaren ritas  
 */
//rita spelare
Player.prototype.renderPlayer = function(context, canvasTop, canvasCenter)
{
    //Spelaren placeras alltid i mitten av canvasen(horisontalt)
    var playerCanvasPosition = canvasCenter - this.width/2;     
            
    
    context.fillStyle = "#0000FF";
    context.drawImage(this.player, playerCanvasPosition, this.posY - canvasTop, 22, 40);

    return "test";
};

