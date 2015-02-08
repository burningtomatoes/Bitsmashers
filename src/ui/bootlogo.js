var BootLogo = {
    show: function(cb) {
        if (Settings.DebugSkipBootLogo) {
            cb();
            return;
        }

        AudioOut.playSfx('burningtomato.wav');

        $('#burningtomato').delay(500).fadeIn(500, function() {
            window.setTimeout(function() {
                $('#burningtomato').fadeOut(500, cb);
            }, 1500)
        });
    }
};