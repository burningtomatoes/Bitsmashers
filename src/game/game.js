var Game = {
    buildCode: 1000,

    images: null,
    audio: null,
    stages: null,

    stage: null,

    inGame: false,

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
        console.info('[Game] Starting game...');

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

    loading: false,

    loadStage: function (id) {
        $('#mainmenu').fadeOut();
        $('#game').hide();
        $('#uded').stop().fadeOut('fast');
        $('#go').stop().fadeOut('fast');
        $('#scoreboard').hide();

        Game.stage = null;

        var stage = this.stages.load(id);
        stage.onLoaded = function (stage) {
            Game.stage = stage;
            Game.inGame = true;

            Camera.centerToMap();

            console.info('[Game] Stage has loaded. Revealing canvas.');

            $('#game').fadeIn('fast');

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
            }
        };
    },

    draw: function (ctx) {
        if (this.stage) {
            this.stage.draw(ctx);
        }

        Camera.update();

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
        
        if (this.stage) {
            this.stage.update();
            PlayerControls.update();
        }

        if (MainMenu.running) {
            MainMenu.update();
        }

        Keyboard.update();
    }
};