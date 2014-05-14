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

function playerAction(keys, player, cd)
{
       
        //hopp och kolla vertikala kollisioner 
        cd.checkForYCollision(keys[87]);


        //horisontell rörelse      
        if(keys[65])//A
        {        
            player.direction = 1;
            cd.checkForXCollision();
        }

        else if(keys[68])//D
        {
            player.direction = 0;
            cd.checkForXCollision();
        }
        
        //slag
        if(keys[16] && player.hitState === 0) //Shift
        {
            cd.hitting();
            player.hitState = 30;   
        }
          
        //Hindrar spelaren från att hålla in slå-knappen och krossa alla väggar.
        else if(player.hitState !== 0)
        {
            player.hitState--;
        }
}
