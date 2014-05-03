var init = function(){
    
    var socket = io.connect();
    socket.emit('sendMap', {gameMode:"sp"}); //skicka single-player-bana
    socket.on('map', function(data){
        
        //hämtar in canvas-elementet. context = 2d
        var canvas = document.getElementById("gamecanvas");
        var context = canvas.getContext("2d");
        canvas.width = 1000;
        canvas.height = 1000;

        //skapar ett spel-objekt
        var game = new Game(data,canvas,context);
        
        //visar instruktioner för användaren
        game.getInstructions();
        
        //Klicka på Enter för att ta bort 
        document.addEventListener('keydown', function(event) {
            
            
            if(event.keyCode == 13)
            {
                //säger till servern att spelet startar.
                socket.emit("gameIsOn");
                
                //startar spelet.
                game.gameInit();
            }
        });

        

        
    });
    
};
window.onload = init();
