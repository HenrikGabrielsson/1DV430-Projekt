var init = function()
{
    var s = document.getElementById("buttonOfDoom");
    s.onclick = function() 
    {
        var socket = io.connect('/');
        socket.emit("test",{hello:"world"});
    };

};

window.onload = init();