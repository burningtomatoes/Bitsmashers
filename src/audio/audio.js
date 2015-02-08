var AudioOut = {
    playSfx: function (fileName, volume) {
        var file = Game.audio.load(fileName);
        file.play();
    }
};