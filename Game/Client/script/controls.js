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
    });
    
    //släpper tangent
    document.addEventListener('keyup', function(event) {
        
        keys[event.keyCode] = false;
    });

    return keys;
    
}

function playerAction(keys, cd, jump, left, right, hit, player, opponent)
{
       
        //hopp och kolla vertikala kollisioner 
        cd.checkForYCollision(player, keys[jump]);
        
        if(!keys[left] && !keys[right]) //karaktären står still
        {
            player.standingStill = true;
        }

        if(keys[left])
        {    
            player.standingStill = false;        
            player.direction = 1;
            cd.checkForXCollision(player);
        }

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
