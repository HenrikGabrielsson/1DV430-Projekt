/**
 *  Konstruktor för Player-objektet
 * 
 * @param   map             Använder banan för att veta vart spelaren spawnar.
 * @param   playerNumber    Spelaren är spelare 1 eller 2 i mp. 
 * @param   playerControls  En array med keycodes till de kontroller som spelaren ska använda  
 */
function Player(map, playerNumber, playerControls)
{
    //spelare 1's startposition
    if(playerNumber === 0)
    {
        this.posX = map.tileSize * 5;
    }
    //spelare 2's startposition
    else if(playerNumber === 1)
    {
        this.posX = (map.rows * map.tileSize) - 5 * map.tileSize;  
    }
    
    this.posY = (map.rows-2) * map.tileSize,
    
    this.reach = 17; //så här långt kan spelaren slå.

    //en motståndare i ett mp-omgång över nätet.
    this.playerNumber = playerNumber;
    
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

    //står still?
    this.standingStill = true;   

    //slag
    this.hitState = 0;

    //Om denna är sann så är spelaren död...
    this.isDead = false;
    
    //sprite
    this.playerSprite = new Image();
    this.playerSprite.src = "pics/playerSprite.png";
    this.currentSprite = 0;

    //kontroller om det finns
    if(playerControls !== undefined)
    {
        this.jump = playerControls[0];
        this.left = playerControls[1];
        this.right = playerControls[2];
        this.hit = playerControls[3];
    }

   
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
    if(canvasLeft !== undefined)
    {
        canvasPosX = this.posX - canvasLeft;
    }         
    else
    {
        canvasPosX = canvasCenter - this.width/2; 
    }
    

    //om spelare står still eller hoppar och kollar åt vänster
    if((this.jumpState > 0 || this.standingStill) && this.direction === 1)
    {

            if(Math.floor(this.hitState / 10) && this.jumpState > 0)//spelaren slår och hoppar
            {
                context.drawImage(this.playerSprite, this.width*8 + (this.width + this.reach) * 6 + this.width, (this.height+this.reach)*this.playerNumber , this.width, this.height + this.reach,   canvasPosX, this.posY - canvasTop - this.reach, this.width, this.height + this.reach );
            }
            else if (Math.floor(this.hitState / 10) && this.standingStill) //spelare slår och står still
            {
                context.drawImage(this.playerSprite, this.width*8 + (this.width + this.reach) * 3 + (Math.floor(this.hitState / 10)-1)*(this.width+this.reach), (this.height+this.reach)*this.playerNumber, this.width+this.reach, this.height,   canvasPosX - this.reach, this.posY - canvasTop, this.width+this.reach, this.height );
            }
            else
            {
                context.drawImage(this.playerSprite, this.width * 4, (this.height+this.reach)*this.playerNumber, this.width, this.height, canvasPosX, this.posY - canvasTop, this.width, this.height);      
            }        
    }



    //om spelare står still eller hoppar och kollar åt höger
    else if((this.jumpState > 0 || this.standingStill) && this.direction === 0)
    {
            if(Math.floor(this.hitState / 10) && this.jumpState > 0)//spelaren slår och hoppar
            {
                context.drawImage(this.playerSprite, this.width*8 + (this.width + this.reach) * 6, (this.height+this.reach)*this.playerNumber, this.width, this.height + this.reach,   canvasPosX, this.posY - canvasTop - this.reach, this.width, this.height + this.reach );
            }
            else if (Math.floor(this.hitState / 10)) //spelare slår
            {
                context.drawImage(this.playerSprite, this.width*8 + (Math.floor(this.hitState / 10)-1)*(this.width+this.reach), (this.height+this.reach)*this.playerNumber, this.width+this.reach, this.height,   canvasPosX, this.posY - canvasTop, this.width+this.reach, this.height );
            }
            else
            {
                context.drawImage(this.playerSprite, 0, (this.height+this.reach)*this.playerNumber, this.width, this.height, canvasPosX, this.posY - canvasTop, 22, 40);
            }
    }



    //om spelare går åt höger
    else if(this.direction === 0)
    {
        if (Math.floor(this.hitState / 10)) //spelare slår
        {
            context.drawImage(this.playerSprite, this.width*8 + (Math.floor(this.hitState / 10)-1)*(this.width+this.reach), (this.height+this.reach)*this.playerNumber, this.width+this.reach, this.height,   canvasPosX, this.posY - canvasTop, this.width+this.reach, this.height );
        }
        else
        {
            context.drawImage(this.playerSprite, this.width * this.currentSprite, (this.height+this.reach)*this.playerNumber, this.width, this.height, canvasPosX, this.posY - canvasTop, this.width, this.height);
            this.currentSprite++;
        }

        if(this.currentSprite > 3)
        {
            this.currentSprite = 0;
        }
    }



    //om spelare går åt vänster
    else if(this.direction === 1)
    {
        if (Math.floor(this.hitState / 10)) //spelare slår
        {
            context.drawImage(this.playerSprite, this.width*8 + (this.width + this.reach) * 3 + (Math.floor(this.hitState / 10)-1)*(this.width+this.reach), (this.height+this.reach)*this.playerNumber, this.width+this.reach, this.height,   canvasPosX - this.reach, this.posY - canvasTop, this.width+this.reach, this.height );
        }

        else
        {
            context.drawImage(this.playerSprite, this.width * this.currentSprite + this.width * 4, (this.height+this.reach)*this.playerNumber, this.width, this.height, canvasPosX, this.posY - canvasTop, this.width, this.height);
            this.currentSprite++;
        }

        //nollställer sprites
        if(this.currentSprite > 3)
        {
            this.currentSprite = 0;
        }
    }

};

