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

            // If this is the host, spawn players, sync clients, and begin the countdown
            // TODO Wait for all clients to complete loading before beginning countdown / sync
            // TODO Clean up code / move to round management
            if (Net.isHost) {
                console.info('[Game] User is host. Spawning players on map and sending sync.');

                for (var i = 0; i < Lobby.players.length; i++) {
                    var player = Lobby.players[i];

                    var fighter = new TheDoctorFighter();
                    fighter.playerNumber = player.number;
                    fighter.player = player;

                    var spawnPos = stage.playerSpawns[i];
                    fighter.posX = spawnPos.x + (fighter.width / 2) + (Settings.TileSize / 2);
                    fighter.posY = spawnPos.y + (fighter.height / 2) + (Settings.TileSize / 2);

                    stage.add(fighter);

                    if (Lobby.localPlayerNumber == player.number) {
                        stage.setPlayer(fighter);
                    }
                }

                stage.syncPlayersOut();
                stage.beginCountdown();
            } else {
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