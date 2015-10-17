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
    },

    update: function () {
        if (!Net.isHost) {
            // This logic only applies to game hosts
            // Begone peer slaves!
            return;
        }

        if (this.state == RoundState.IDLE) {
            // Just freshly initialized, begin init
            if (Game.stage != null && Game.stage.loaded) {
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
            // Await stage load and then go back to starting the round
            if (Game.stage != null && Game.stage.loaded) {
                console.info('[Rounds] Local stage loading complete. Moving to round countdown.');
                this.beginRoundCountdown();
            }
        }

        // TODO Round limitation and game end
    },

    beginRoundCountdown: function () {
        this.reset();

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
    }
};