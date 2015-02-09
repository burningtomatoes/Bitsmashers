var MainMenuOption = {
    HOST_GAME: 0,
    JOIN_GAME: 1,
    SINGLE_PLAYER: 2
};

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
        this.$options.show();
        this.$connecting.hide();

        this.showConnectNotice('Connecting to matchmaking service...');

        this.$element.fadeIn('slow', function () {
            this.$cover.slideDown();
        }.bind(this));
    },

    triggerOption: function () {
        if (!Matchmaking.isConnected() && this.currentOption != MainMenuOption.SINGLE_PLAYER) {
            AudioOut.playSfx('error.wav');
            this.showConnectNotice('Still trying to connect! Hold on...');

            if (!Matchmaking.isConnecting) {
                Matchmaking.connect();
            }

            return;
        }

        AudioOut.playSfx('ui_tick.wav');

        switch (this.currentOption) {
            case MainMenuOption.HOST_GAME:
                Net.hostGame();
                break;

            case MainMenuOption.JOIN_GAME:
                Net.joinGame();
                break;

            case MainMenuOption.SINGLE_PLAYER:
                this.$options.find('.opt.o3').text('Yeah, had no time for that. Sorry.');
                AudioOut.playSfx('too_bad.wav');
                break;
        }
    },

    update: function () {
        var keyUp = Keyboard.wasKeyPressed(KeyCode.W) || Keyboard.wasKeyPressed(KeyCode.UP);
        var keyDown = Keyboard.wasKeyPressed(KeyCode.S) || Keyboard.wasKeyPressed(KeyCode.DOWN);
        var keySubmit = Keyboard.wasKeyPressed(KeyCode.SPACE) || Keyboard.wasKeyPressed(KeyCode.RETURN) || Keyboard.wasKeyPressed(KeyCode.ENTER);

        var optionChange = 0;

        if (keySubmit) {
            this.triggerOption();
        } else if (keyUp) {
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

    showConnectNotice: function (text) {
        this.$connecting
            .text(text)
            .slideDown();
    },

    hideConnectNotice: function () {
        this.$connecting.slideUp();
    },

    enableOptions: function () {
        this.$options.show();
    },

    disableOptions: function () {
        this.$options.hide();
    },
};