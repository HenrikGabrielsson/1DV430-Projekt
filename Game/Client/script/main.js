/**
 * Funktion som startar spelet genom att fråga servern efter en bana. Sedan skapar den 
 * ett nytt spelobjekt och visar menyn
 * 
 */

var init = function(){
    
    var socket = io.connect();
    socket.emit('sendMap', {gameMode:"sp"}); //skicka single-player-bana
    socket.on('map', function(data){
        
        //hämtar in canvas-elementet. context = 2d
        var canvas = document.getElementById("gamecanvas");
        var context = canvas.getContext("2d");
        

        //skapar ett spel-objekt
        var game = new Game(data,canvas,context);
        //game.gameMenu();
        game.gameInit();

    });
    
};



window.onload = init();
