/**
 *  Konstruktor för Player-objektet
 * 
 * @param   posX    horisontell position
 * @param   posY    vertikal position
 */
function Player(posX, posY, isOpponent)
{

    //position
    this.posX = posX;
    this.posY = posY;

    this.reach = 60; //så här långt kan spelaren slå.

    //en motståndare i ett mp-omgång över nätet.
    this.isOpponent = isOpponent;
    
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
    
    //sprite
    this.playerSprite = new Image();
    this.playerSprite.src = "pics/playerSprite.png";
    this.currentSprite = 0;

    this.standingStill = true;

    
}

/**
 * Ritar spelaren.
 * 
 * @param   context         Där som spelaren ritas  
 * @param   canvasTop       Pixel där toppen av canvasen är.
 * @param   canvasCenter    canvensen mitpunkt (y-led)
 * @param   canvasLeft      Pixel där vänsterkanten av canvasen är.
 */
//rita spelare
Player.prototype.renderPlayer = function(context, canvasTop, canvasCenter, canvasLeft)
{

    //Spelaren placeras i mitten av canvasen(horisontalt). En motståndare placeras ut normalt på banan.
    var canvasPosX;
    
    if(this.isOpponent)
    {
        canvasPosX = this.posX - canvasLeft;
    }         
    else
    {
        canvasPosX = canvasCenter - this.width/2; 
    }
    

    if((this.jumpState > 0 || this.standingStill) && this.direction === 1)
    {
        context.drawImage(this.playerSprite, this.width * 4, 0, this.width, this.height, canvasPosX, this.posY - canvasTop, 22, 40);        
    }

    else if((this.jumpState > 0 || this.standingStill) && this.direction === 0)
    {
        context.drawImage(this.playerSprite, 0, 0, this.width, this.height, canvasPosX, this.posY - canvasTop, 22, 40);
    }

    else if(this.direction === 0)
    {
        context.drawImage(this.playerSprite, this.width * this.currentSprite, 0, this.width, this.height, canvasPosX, this.posY - canvasTop, 22, 40);

        this.currentSprite++;

        if(this.currentSprite > 3)
        {
            this.currentSprite = 0;
        }
    }
    else if(this.direction === 1)
    {
        context.drawImage(this.playerSprite, this.width * this.currentSprite + this.width * 4, 0, this.width, this.height, canvasPosX, this.posY - canvasTop, 22, 40);

        this.currentSprite++;

        if(this.currentSprite > 3)
        {
            this.currentSprite = 0;
        }
    }


    return "test";
};

