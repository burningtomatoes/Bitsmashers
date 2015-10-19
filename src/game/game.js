var Game = {
    buildCode: 1000,

    images: null,
    audio: null,
    stages: null,

    stage: null,

    inGame: false,
    frozen: false,
    loading: false,

    init: function () {
        console.info('[Game] Initializing BitSmashers R' + this.buildCode + '...');

        Canvas.init();
        Keyboard.bind();
        Net.init();

        this.images = new ImageLoader();
        this.audio = new AudioLoader();
        this.stages = new StageLoader();
    },

    start: function () {
        console.info('[Game] Starting game...')

        this.frozen = false;

        if (Settings.DebugQuickStart) {
            Net.hostGame();
            Lobby.onUserConnected(null);
            Lobby.onUserConnected(null);
            Lobby.onUserConnected(null);
            Lobby.startGame();
            //this.loadStage('green');
            return;
        }

        Canvas.$canvas.hide();

        BootLogo.show(function() {
            MainMenu.show();
        });
    },

    freeze: function () {
        this.frozen = true;
    },

    unfreeze: function () {
        this.frozen = false;
    },

    loadStage: function (id) {
        // Ensure the game, menu and HUD overlays are hidden
        $('#mainmenu').fadeOut();
        $('#game').hide();
        $('#uded').stop().fadeOut('fast');
        $('#go').stop().fadeOut('fast');
        $('#scoreboard').hide();

        // Unload previous stage and restore update loop
        Game.stage = null;
        Game.inGame = false;
        Game.unfreeze();

        // Ask the stage loader to asynchronously download and configure the map
        var stage = this.stages.load(id);
        stage.onLoaded = function (stage) {
            // Map has been loaded successfully
            Game.stage = stage;
            Game.inGame = true;

            // Ensure camera is reset perfectly, without seeing any panning between loads
            Camera.trackHard = true;
            Camera.centerToMap();
            Camera.update();
            Camera.trackHard = false;

            // Reveal game canvas
            console.info('[Game] Stage has loaded. Revealing canvas.');
            $('#game').fadeIn('fast').focus();

            // Inform host we are ready to go
            if (!Net.isHost) {
                Net.getConnection().sendMessage({ op: Opcode.LOAD_COMPLETE_NOTIFY });
            }
        };
    },

    draw: function (ctx) {
        if (this.stage) {
            this.stage.draw(ctx);
        }

        if (!this.frozen) {
            Camera.update();
        }

        if (Settings.DebugCollision) {
            if (this.stage != null) {
                $('#debug').text('Entity count: ' + this.stage.entities.length);
            } else {
                $('#debug').text('No stage loaded');
            }
        }
    },

    update: function () {
        Rounds.update();
        
        if (this.stage && !this.frozen) {
            this.stage.update();
            PlayerControls.update();
        }

        if (MainMenu.running) {
            MainMenu.update();
        }

        Keyboard.update();
    }
};