/**
 * Funktion som startar spelet genom att fråga servern efter en bana. Sedan skapar den 
 * ett nytt spelobjekt och visar menyn
 * 
 */
function init(){
    
    //har ett spel redan startats
    var gameHasStarted = false;

    var socket = io.connect(); //används för att kommunicera med server

    //hämta canvas och dess context
    var canvas = document.getElementsByClassName("gamecanvas")[0];
    var context = canvas.getContext("2d");
    canvas.height = 600;
    canvas.width = 900;
        
    //visa meny
    gameMenu(canvas, socket);


    //när en bana skickas från servern så startar spelet.
    socket.on('map', function(data){

        //ibland tas banan emot många gånger. Får bara tas emot en gång
        if(!gameHasStarted)
        {
            //skapar ett spel-objekt och startar det
            var game = new Game(data,canvas,socket);
            game.gameInit(data.playerNumber);

            gameHasStarted = true;
        }
    });
    
};

/**
 * Ritar menyer i början av spelet och gör dem interaktiva genom att 
 * lyssna på olika events
 *
 * @param   canvas  canvasen där menyn ska ritas
 * @param   socket  socket som man ska tala med servern igenom.
 *
 */
//Visa huvudmenyn
function gameMenu(canvas, socket)
{
    var context = canvas.getContext("2d");//hämta context
    
    var fontSize = 18;

    var gap = 100; //utrymme mellan knapparna
    
    //är det huvudmeny eller undermeny?
    var mainmenu = true;

    //bild för knappen
    var button = new Image(300, 60);
    button.src = "pics/button.jpg";
    
    //när bilden har laddat klart så ritas den upp på canvasen
    button.addEventListener("load", function()
    {
        context.fillStyle = "black";
        context.textAlign = "center";
        
        //singleplayer-knappen
        context.drawImage(button, 0,0,button.width, button.height, canvas.width/2 - button.width/2 , canvas.height/2 - button.height/2, button.width, button.height)  
        context.font = fontSize+"px Arial";
        context.fillText("Singleplayer", canvas.width/2  , canvas.height/2+fontSize/2);
        
        
        
        
        //multiplayer-knappen
        context.drawImage(button, 0,0,button.width, button.height, canvas.width/2 - button.width/2 , canvas.height/2 - button.height/2 + gap+button.height, button.width, button.height)  
        context.font = fontSize+"px Arial";
        context.fillText("Multiplayer", canvas.width/2  , canvas.height/2 + gap + button.height + fontSize/2);
        
    },false);
    

   
    //funktion som körs när användaren interagerar med spelmenyn
    function menuFunction(e)
        {

            var canvasRectangle = canvas.getBoundingClientRect();

            //spara mus-koordinater vid klick
            var mouseX = e.clientX - canvasRectangle.left;
            var mouseY = e.clientY - canvasRectangle.top;


            //singleplayer
            if(mainmenu && mouseX >= canvas.width/2 - button.width/2 && mouseX <= canvas.width/2 + button.width/2 && mouseY >= canvas.height/2 - button.height/2 && mouseY <= canvas.height/2 + button.height/2)
            {

                canvas.removeEventListener("click",menuFunction,false);
                
                socket.emit('startGame', {gameMode:"sp"}); //skicka single-player-bana
            }

            //multiplayer
            else if(mainmenu && mouseX >= canvas.width/2 - button.width/2 && mouseX <= canvas.width/2 + button.width/2 && mouseY >= canvas.height/2 - button.height/2 + gap + button.height && mouseY <= canvas.height/2 - button.height/2 + gap + button.height*2)
            {
                mainmenu = false;
                
                //ta bort tidigare meny
                context.clearRect(0,0,canvas.width,canvas.height);
                
                //multiplayer online
                context.drawImage(button, 0,0,button.width, button.height, canvas.width/2 - button.width/2 , canvas.height/2 - button.height/2, button.width, button.height)  
                
                context.font = fontSize+"px Arial";
                context.fillText("Play with stranger", canvas.width/2  , canvas.height/2+fontSize/2);
                
                
                
                
                
                //multiplayer knappen
                context.drawImage(button, 0,0,button.width, button.height, canvas.width/2 - button.width/2 , canvas.height/2 - button.height/2 + gap+button.height, button.width, button.height) 
                
                context.font = fontSize+"px Arial";
                context.fillText("Play with friend(Share keyboard)", canvas.width/2  , canvas.height/2 + gap + button.height + fontSize/2);
                
            }
            
            //multiplayer with stranger (mp1)
            else if(!mainmenu && mouseX >= canvas.width/2 - button.width/2 && mouseX <= canvas.width/2 + button.width/2 && mouseY >= canvas.height/2 - button.height/2 && mouseY <= canvas.height/2 + button.height/2)
            {
                canvas.removeEventListener("click",menuFunction,false);

                //meddelar användaren att spelet laddar.
                context.clearRect(0, 0, canvas.width, canvas.height);

                context.fillStyle = "white";
                context.font = fontSize+"px Arial";
                context.fillText("Looking for other players. Please wait...", canvas.width/2  , canvas.height/2 + fontSize/2);

                socket.emit('startGame', {gameMode:"mp1"}); //eftefråga multi-player-bana
            }

            //multiplayer with friend (mp2)
            else if(!mainmenu && mouseX >= canvas.width/2 - button.width/2 && mouseX <= canvas.width/2 + button.width/2 && mouseY >= canvas.height/2 - button.height/2 + gap + button.height && mouseY <= canvas.height/2 - button.height/2 + gap + button.height*2)
            {
                canvas.removeEventListener("click",menuFunction,false);
                
                socket.emit('startGame', {gameMode:"mp2"}); //efterfråga multiplayer-bana
            }
        }
    
    //event listeners till knapparna.
    canvas.addEventListener("click",menuFunction,false);    
}


window.onload = init();
