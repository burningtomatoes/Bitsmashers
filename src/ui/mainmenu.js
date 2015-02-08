var MainMenu = {
    running: false,
    $element: $('#mainmenu'),
    $cover: $('#mainmenu .section'),
    $connecting: $('#mainmenu .connecting'),
    $options: $('#mainmenu .options'),

    currentOption: 0,

    show: function () {
        if (this.running) {
            return;
        }

        this.running = true;

        this.$cover.hide();

        if (Network.status == null || Network.status == NetworkStatus.CREATING_SESSION ||
            NetworkStatus.status == NetworkStatus.NOT_SUPPORTED) {
            this.$options.hide();
            this.$connecting.show();
        } else {
            this.$options.show();
            this.$connecting.hide();
        }

        this.$element.fadeIn('slow', function () {
            this.$cover.slideDown();
        }.bind(this));
    },

    update: function () {
        var keyUp = Keyboard.wasKeyPressed(KeyCode.W) || Keyboard.wasKeyPressed(KeyCode.UP);
        var keyDown = Keyboard.wasKeyPressed(KeyCode.S) || Keyboard.wasKeyPressed(KeyCode.DOWN);

        var optionChange = 0;

        if (keyUp) {
            optionChange = -1;
        } else if (keyDown) {
            optionChange = +1;
        }

        if (optionChange != 0) {
            AudioOut.playSfx('ui_tick.wav');

            this.currentOption += optionChange;

            var optLength = this.$options.find('.opt').length;

            if (this.currentOption < 0) {
                this.currentOption = optLength - 1;
            } else if (this.currentOption >= optLength) {
                this.currentOption = 0;
            }



            this.$options.find('.opt').removeClass('active');
            $(this.$options.find('.opt').get(this.currentOption)).addClass('active');
        }
    },

    enableOptions: function () {
        this.$options.show();
    },

    showConnectNotice: function (text) {
        this.$connecting
            .text(text)
            .show();
    },

    hideConnectNotice: function () {
        this.$connecting.hide();
        this.enableOptions();
    }
};