var RoundState = {
    IDLE: -1,
    STARTING_ROUND_COUNTDOWN: 0,
    ROUND_IN_PROGRESS: 1,
    END_OF_ROUND: 2,
    ROUND_TRANSITIONING: 3,
    END_OF_GAME: 4
};

var CountdownTimings = {
    GAME_START_SECS: 3,
    GAME_TWEEN_ROUND_SECS: 6
};

var Rounds = {
    state: RoundState.IDLE,

    countdownStartedAt: 0,

    loadReadies: [],

    getUnixTs: function () {
        return Math.round((new Date()).getTime() / 1000);
    },

    beginCountdown: function () {
        this.countdownStartedAt = this.getUnixTs();
    },

    getCountdownSeconds: function () {
        var now = this.getUnixTs();
        return now - this.countdownStartedAt;
    },

    reset: function () {
        this.state = RoundState.IDLE;
        this.countdownStartedAt = false;
        this.clearLoadReady();
    },

    setLoadReady: function (player) {
        if (this.loadReadies.indexOf(player) == -1) {
            this.loadReadies.push(player.number);
            console.info('Load ready event received from player #' + player.number);
        }
    },

    clearLoadReady: function () {
        this.loadReadies = [];
    },

    isLoadReady: function () {
        for (var i = 0; i < Lobby.players.length; i++) {
            var player = Lobby.players[i];

            // TODO Check if player lost connection, if so: skip them and drop them from the match

            // If this player is the host -- us -- then it will never send a load ready event to itself
            // Only break out if the map has not loaded locally
            if (player.isHost) {
                if (Game.stage == null || !Game.stage.loaded) {
                    return false;
                }

                continue;
            }

            // If this player has not (yet) sent a load ready message, we are not ready to continue
            if (this.loadReadies.indexOf(player.number) == -1) {
                if (Settings.DebugQuickStart) {
                    // Debug mode with fake players
                    // Do not require load events
                    continue;
                }

                return false;
            }
        }

        return true;
    },

    update: function () {
        if (!Net.isHost) {
            // This logic only applies to game hosts
            // Begone peer slaves!
            return;
        }

        if (this.state == RoundState.IDLE) {
            // Just freshly initialized, begin init when all players are loaded up
            if (this.isLoadReady()) {
                Scoreboard.reset();
                this.beginRoundCountdown();
                console.info('[Rounds] Beginning countdown to first round.');
            }

            return;
        }

        if (this.state == RoundState.STARTING_ROUND_COUNTDOWN) {
            // First round of the game starting, await countdown and then "GO!"
            if (this.getCountdownSeconds() >= CountdownTimings.GAME_START_SECS) {
                console.info('[Rounds] Starting the round.');
                this.beginRound();
            }

            return;
        }

        if (this.state == RoundState.ROUND_IN_PROGRESS) {
            // Round started - if all but one player is dead, end the round
            if (Game.stage != null) {
                if (Game.stage.getLivePlayerCount() <= 1) {
                    console.info('[Rounds] All players eliminated, ending round.');
                    this.endRound();
                }
            }

            return;
        }

        if (this.state == RoundState.END_OF_ROUND) {
            // Round ended - scoreboard so far is shown to the players
            // Await countdown and then begin the next round
            if (this.getCountdownSeconds() >= CountdownTimings.GAME_TWEEN_ROUND_SECS) {
                console.info('[Rounds] End of round scoreboard complete. Preparing next round.');
                this.transitionToNextRound();
            }

            return;
        }

        if (this.state == RoundState.ROUND_TRANSITIONING) {
            // Round end scoreboard is gone, we are (re)loading the stage now
            // Await stage load for all players and then go back to starting the round
            if (this.isLoadReady()) {
                console.info('[Rounds] Local stage loading complete. Moving to round countdown.');
                this.beginRoundCountdown();
            }
        }

        // TODO Round limitation and game end
    },

    spawnRound: function () {
        // If this is the host, spawn players, sync clients, and begin the countdown
        console.info('[Game] User is host. Spawning players on map and sending sync.');

        for (var i = 0; i < Lobby.players.length; i++) {
            var player = Lobby.players[i];

            var fighter = new TheDoctorFighter();
            fighter.playerNumber = player.number;
            fighter.player = player;

            var spawnPos = Game.stage.playerSpawns[i];
            fighter.posX = spawnPos.x + (fighter.width / 2) + (Settings.TileSize / 2);
            fighter.posY = spawnPos.y + (fighter.height / 2) + (Settings.TileSize / 2);

            Game.stage.add(fighter);

            if (Lobby.localPlayerNumber == player.number) {
                Game.stage.setPlayer(fighter);
            }
        }

        Game.stage.syncPlayersOut();
        Game.stage.beginCountdown();
    },

    beginRoundCountdown: function () {
        this.reset();
        this.spawnRound();

        var msgRoundStart = { op: Opcode.COUNTDOWN_START };

        Net.broadcastMessage(msgRoundStart);

        this.state = RoundState.STARTING_ROUND_COUNTDOWN;
        this.beginCountdown();
    },

    beginRound: function () {
        var msgRoundStart = { op: Opcode.GO };

        Net.broadcastMessage(msgRoundStart);
        Router.processData(msgRoundStart);

        this.state = RoundState.ROUND_IN_PROGRESS;
        this.beginCountdown();
    },

    transitionToNextRound: function () {
        var mapId = 'green';

        var gameStart = {
            op: Opcode.START_GAME,
            mapId: mapId
        };

        Net.broadcastMessage(gameStart);
        Router.processData(gameStart);

        this.state = RoundState.ROUND_TRANSITIONING;
        this.beginCountdown();
    },

    endRound: function () {
        var lastPlayer = Game.stage.getLastManStanding();

        if (lastPlayer != null) {
            Scoreboard.registerWin(lastPlayer);
        }

        var msgRoundComplete = { op: Opcode.ROUND_FINISH };

        Net.broadcastMessage(msgRoundComplete);
        Router.processData(msgRoundComplete);

        this.state = RoundState.END_OF_ROUND;
        this.beginCountdown();

        Scoreboard.syncScoresOut();
        Scoreboard.prepareScoreboard();

        this.clearLoadReady();
    }
};