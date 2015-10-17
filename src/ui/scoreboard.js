var Scoreboard = {
    kills: { },
    wins: { },
    deaths: { },
    $table: $('#scoreboard table tbody'),

    reset: function () {
        this.kills =    { 1: 0, 2: 0, 3: 0, 4: 0 };
        this.wins =     { 1: 0, 2: 0, 3: 0, 4: 0 };
        this.deaths =   { 1: 0, 2: 0, 3: 0, 4: 0 };
    },

    registerKill: function (player) {
        if (player.player) player = player.player;
        this.kills[player.number]++;
    },

    registerWin: function (player) {
        if (player.player) player = player.player;
        this.wins[player.number]++;
    },

    registerDeath: function (player) {
        if (player.player) player = player.player;
        this.deaths[player.number]++;
    },

    prepareScoreboard: function () {
        var calcScore = function (player) {
            var s = 0;
            s += (player.wins * 1000);
            s += (player.kills * 100);
            s += (player.deaths * -50);
            return s;
        };

        // Attach score data to the player objects, ready for sorting
        for (var i = 0; i < Lobby.players.length; i++) {
            var player = Lobby.players[i];
            player.wins = this.wins[player.number];
            player.kills = this.kills[player.number];
            player.deaths = this.deaths[player.number];
            player.score = calcScore(player);
        }

        // Sort the players array by their internal score
        var sorted = Lobby.players.sort(function (a, b) {
            if (a.score < b.score) return -1;
            if (b.score > a.score) return 1;
            return 0;
        });

        // Prepare the UI
        this.$table.html('');

        for (var i = 0; i < sorted.length; i++) {
            var player = sorted[i];

            var $row = $('<tr />')
                .appendTo(this.$table);

            $('<td />')
                .text('Player ' + player.number)
                .css('color', player.getColor())
                .appendTo($row);

            $('<td />')
                .text('The Doctor')
                .appendTo($row);

            $('<td />')
                .text(player.kills)
                .appendTo($row);

            $('<td />')
                .text(player.deaths)
                .appendTo($row);

            $('<td />')
                .text(player.wins)
                .appendTo($row);

            $('<td />')
                .text(player.score > 0 ? player.score : 0)
                .appendTo($row);
        }
    },

    syncScoresOut: function () {
        if (!Net.isHost) {
            return;
        }

        var payload = {
            op: Opcode.SCOREBOARD,
            k: this.kills,
            w: this.wins,
            d: this.deaths
        };

        Net.broadcastMessage(payload);
    },

    syncScoresIn: function (data) {
        if (Net.isHost) {
            return;
        }

        this.kills = data.k;
        this.wins = data.w;
        this.deaths = data.d;

        this.prepareScoreboard();
    }
};