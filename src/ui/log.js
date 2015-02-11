var Log = {
    clear: function () {
        var $log = $('#log');
        $log.html('');
    },

    writeMessage: function (text) {
        var $log = $('#log');

        var $msg = $('<div />')
            .addClass('message')
            .text(text)
            .prependTo($log);

        $msg.fadeIn('fast').delay(3000).fadeOut(5000);
    }
};