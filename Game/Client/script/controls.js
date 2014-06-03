/**
 * Funktion som lyssnar efter de knappar som trycks in och returnerar en array med booleaner.
 * Om de är nedtryckta = True. Annars = False. 
 *
 * @param   player      spelare 1. Behöver ha dess kontroller.
 * @param   opponent    spelare 2 vid splitscreen. Behöver ha dess kontroller.
 * 
 *@Return   keys    En array med de tangenter som har tryckts ner ellers släppts.
*/
function listenToKeyboardInput(player, opponent)
{
    var keys = [];

    //spelarnas kontroller
    var playerControls = [player.jump, player.left, player.right, player.hit];
    var opponentControls = [];

    if(opponent !== undefined)
    {
        var opponentControls = [opponent.jump, opponent.left, opponent.right, opponent.hit];
    }



    //trycker på tangent
    document.addEventListener('keydown', function(event) {
        
        if(playerControls.indexOf(event.keyCode) > -1 || opponentControls.indexOf(event.keyCode) > -1)
        { 
            event.preventDefault();
            keys[event.keyCode] = true;
            return false;
        }
    });
    
    //släpper tangent
    document.addEventListener('keyup', function(event) {

        if(playerControls.indexOf(event.keyCode) >= 0 || opponentControls.indexOf(event.keyCode >= 0))
        {
            event.preventDefault();
            keys[event.keyCode] = false;
            return false;
        }
    });

    return keys;
    
}


/**
 * Utför olika händelser beroende på spelarens input
 * 
 * @param   keys        array med knappar som tryckts ner
 * @param   cd          collision detector som ska användas
 * @param   player      spelaren som ska gå
 * @param   opponent    motspelaren 
 */
function playerAction(keys, cd, player, opponent)
{

        cd.checkForYCollision(player, keys[player.jump]);
        
        if(!keys[player.left] && !keys[player.right]) //karaktären står still
        {
            player.standingStill = true;
        }

        //vänster
        if(keys[player.left])
        {    
            player.standingStill = false;        
            player.direction = 1;
            cd.checkForXCollision(player);
        }

        //höger
        else if(keys[player.right])
        {
            player.standingStill = false; 
            player.direction = 0;
            cd.checkForXCollision(player);
        }
        
        //slag
        if(keys[player.hit] && player.hitState === 0) //Shift
        {
            cd.hitting(player, opponent);
            player.hitState = 30;   
        }
          
        //Hindrar spelaren från att hålla in slå-knappen och krossa alla väggar.
        else if(player.hitState !== 0)
        {
            player.hitState--;
        }
}
