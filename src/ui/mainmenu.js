var MainMenuOption = {
    START_GAME: 0,
    CANCEL: 1,
    HOST_GAME: 2,
    JOIN_GAME: 3,
    SINGLE_PLAYER: 4
};

var MainMenu = {
    running: false,
    $element: $('#mainmenu'),
    $cover: $('#mainmenu .section'),
    $connecting: $('#mainmenu .connecting'),
    $options: $('#mainmenu .options'),

    currentOption: 2,
    secondaryMode: false,

    show: function () {
        if (this.running) {
            return;
        }

        this.running = true;

        this.$cover.hide();
        this.$options.show();
        this.$connecting.hide();

        this.disableOptions();

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
            case MainMenuOption.CANCEL:
                if (!this.secondaryMode) {
                    break;
                }

                Matchmaking.disconnect(false);
                location.reload();
                break;

            case MainMenuOption.START_GAME:
                if (!this.secondaryMode || !Net.isHost) {
                    break;
                }

                Lobby.startGame();
                break;

            case MainMenuOption.HOST_GAME:
                if (this.secondaryMode) {
                    break;
                }

                Net.hostGame();
                break;

            case MainMenuOption.JOIN_GAME:
                if (this.secondaryMode) {
                    break;
                }

                Net.joinGame();
                break;

            case MainMenuOption.SINGLE_PLAYER:
                if (this.secondaryMode) {
                    break;
                }

                this.$options.find('.opt.o4').text('Yeah, had no time for that. Sorry.');
                AudioOut.playSfx('too_bad.wav');
                break;
        }
    },

    update: function () {
        if (Game.inGame) {
            return;
        }

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

        var doOptionChange = function () {
            this.currentOption += optionChange;

            var optLength = this.$options.find('.opt').length;

            if (this.currentOption < 0) {
                this.currentOption = optLength - 1;
            } else if (this.currentOption >= optLength) {
                this.currentOption = 0;
            }

            this.$options.find('.opt').removeClass('active');
            $(this.$options.find('.opt').get(this.currentOption)).addClass('active');
        }.bind(this);

        if (optionChange != 0) {
            AudioOut.playSfx('ui_tick.wav');

            var breakout = 10;

            do {
                doOptionChange();
                breakout--;
            } while (!$(this.$options.find('.opt').get(this.currentOption)).is(':visible') && breakout > 0);
        }

        if (Net.busy) {
            this.disableOptions();
        } else {
            this.enableOptions();
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
        if (!this.secondaryMode) {
            return;
        }

        this.secondaryMode = false;
        this.$options.find('.primary').show();
        this.$options.find('.secondary').hide();
        this.$element.find('.lobby').hide();
    },

    disableOptions: function () {
        if (this.secondaryMode) {
            return;
        }

        this.secondaryMode = true;
        this.$options.find('.primary').hide();
        this.$options.find('.secondary').show();
        this.$element.find('.lobby').show();

        if (!Net.isHost) {
            this.$options.find('.opt.o0').hide();
        } else {
            this.$options.find('.opt.o0').show();
        }
    }
};