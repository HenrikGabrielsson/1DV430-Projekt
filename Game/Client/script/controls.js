/**
 * Funktion som lyssnar efter de knappar som trycks in och returnerar en array med booleaner.
 * Om de är nedtryckta = True. Annars = False. 
 *
 *@Return   keys    En array med de tangenter som har tryckts ner ellers släppts.
*/
function listenToKeyboardInput()
{
    var keys = [];

    //trycker på tangent
    document.addEventListener('keydown', function(event) {
        
        keys[event.keyCode] = true;
        return false;
    });
    
    //släpper tangent
    document.addEventListener('keyup', function(event) {
        keys[event.keyCode] = false;
        return false;
    });

    return keys;
    
}


/**
 * Utför olika händelser beroende på spelarens input
 * 
 * @param   keys        array med knappar som tryckts ner
 * @param   cd          collision detector som ska användas
 * @param   jump        knapp för att hoppa
 * @param   left        knapp för att gå till vänster
 * @param   right       knapp för att gå till höger
 * @param   player      spelaren som ska gå
 * @param   opponent    motspelaren 
 */
function playerAction(keys, cd, jump, left, right, hit, player, opponent)
{
       
        //hopp och kolla vertikala kollisioner 
        cd.checkForYCollision(player, keys[jump]);
        
        if(!keys[left] && !keys[right]) //karaktären står still
        {
            player.standingStill = true;
        }

        //vänster
        if(keys[left])
        {    
            player.standingStill = false;        
            player.direction = 1;
            cd.checkForXCollision(player);
        }

        //höger
        else if(keys[right])
        {
            player.standingStill = false; 
            player.direction = 0;
            cd.checkForXCollision(player);
        }
        
        //slag
        if(keys[hit] && player.hitState === 0) //Shift
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
