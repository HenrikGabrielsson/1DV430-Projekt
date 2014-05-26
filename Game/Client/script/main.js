/**
 * Funktion som startar spelet genom att fråga servern efter en bana. Sedan skapar den 
 * ett nytt spelobjekt och visar menyn
 * 
 */

var init = function(){
    
    var socket = io.connect();

    var canvas = document.getElementsByClassName("gamecanvas")[0];
    var context = canvas.getContext("2d");

    canvas.height = 600;
    canvas.width = 900;
        

    gameMenu(canvas,context, socket);

    socket.on('map', function(data){
    
        //skapar ett spel-objekt
        var game = new Game(data,canvas,context);

        game.gameInit(data.playerNumber);
    });
    
};

/**
 * Ritar menyer i början av spelet och gör dem interaktiva genom att 
 * lyssna på olika events
 */
//Visa huvudmenyn
function gameMenu(canvas, context, socket)
{
    
    var fontSize = 18;
    var buttonWidth = 300;
    var buttonHeight = 60;

    var gap = 100;
    
    var mainmenu = true;

    var button = new Image();
    button.src = "pics/button.jpg";
    
    button.addEventListener("load", function()
    {
        context.fillStyle = "black";
        context.textAlign = "center";
        
        //singleplayer-knappen
        context.drawImage(button, 0,0,buttonWidth, buttonHeight, canvas.width/2 - buttonWidth/2 , canvas.height/2 - buttonHeight/2, buttonWidth, buttonHeight)  
        
        context.font = fontSize+"px Arial";
        context.fillText("Singleplayer", canvas.width/2  , canvas.height/2+fontSize/2);
        
        
        
        
        //multiplayer-knappen
        context.drawImage(button, 0,0,buttonWidth, buttonHeight, canvas.width/2 - buttonWidth/2 , canvas.height/2 - buttonHeight/2 + gap+buttonHeight, buttonWidth, buttonHeight) 
        
        context.font = fontSize+"px Arial";
        context.fillText("Multiplayer", canvas.width/2  , canvas.height/2 + gap + buttonHeight + fontSize/2);
        
    },false);
    

   
    //funktion som körs när användaren interagerar med spelmenyn
    function menuFunction(e)
        {
            
            //spara
            var mouseX = e.x - canvas.offsetLeft;
            var mouseY = e.y - canvas.offsetTop;
            
            //singleplayer
            if(mainmenu && mouseX >= canvas.width/2 - buttonWidth/2 && mouseX <= canvas.width/2 + buttonWidth/2 && mouseY >= canvas.height/2 - buttonHeight/2 && mouseY <= canvas.height/2 + buttonHeight/2)
            {
                canvas.removeEventListener("click",menuFunction,false);
                
                socket.emit('startGame', {gameMode:"sp"}); //skicka single-player-bana
                return;
            }
            else if(mainmenu && mouseX >= canvas.width/2 - buttonWidth/2 && mouseX <= canvas.width/2 + buttonWidth/2 && mouseY >= canvas.height/2 - buttonHeight/2 + gap + buttonHeight && mouseY <= canvas.height/2 - buttonHeight/2 + gap + buttonHeight*2)
            {
                mainmenu = false;
                
                //ta bort tidigare meny
                context.clearRect(0,0,canvas.width,canvas.height);
                
                //multiplayer online
                context.drawImage(button, 0,0,buttonWidth, buttonHeight, canvas.width/2 - buttonWidth/2 , canvas.height/2 - buttonHeight/2, buttonWidth, buttonHeight)  
                
                context.font = fontSize+"px Arial";
                context.fillText("Play with stranger", canvas.width/2  , canvas.height/2+fontSize/2);
                
                
                
                
                
                //multiplayer knappen
                context.drawImage(button, 0,0,buttonWidth, buttonHeight, canvas.width/2 - buttonWidth/2 , canvas.height/2 - buttonHeight/2 + gap+buttonHeight, buttonWidth, buttonHeight) 
                
                context.font = fontSize+"px Arial";
                context.fillText("Play with friend(Share keyboard)", canvas.width/2  , canvas.height/2 + gap + buttonHeight + fontSize/2);
                
            }
            
            else if(!mainmenu && mouseX >= canvas.width/2 - buttonWidth/2 && mouseX <= canvas.width/2 + buttonWidth/2 && mouseY >= canvas.height/2 - buttonHeight/2 && mouseY <= canvas.height/2 + buttonHeight/2)
            {
                canvas.removeEventListener("click",menuFunction,false);

                //meddelar användaren att spelet laddar.
                context.clearRect(0, 0, canvas.width, canvas.height);

                context.fillStyle = "white";
                context.font = fontSize+"px Arial";
                context.fillText("Looking for other players. Please wait...", canvas.width/2  , canvas.height/2 + fontSize/2);

                socket.emit('startGame', {gameMode:"mp1"}); //eftefråga multi-player-bana
            }

            else if(!mainmenu && mouseX >= canvas.width/2 - buttonWidth/2 && mouseX <= canvas.width/2 + buttonWidth/2 && mouseY >= canvas.height/2 - buttonHeight/2 + gap + buttonHeight && mouseY <= canvas.height/2 - buttonHeight/2 + gap + buttonHeight*2)
            {
                canvas.removeEventListener("click",menuFunction,false);
                
                socket.emit('startGame', {gameMode:"mp2"}); //efterfråga multiplayer-bana
            }
        }
    
    //event listeners till knapparna.
    canvas.addEventListener("click",menuFunction,false);
    
}


window.onload = init();
