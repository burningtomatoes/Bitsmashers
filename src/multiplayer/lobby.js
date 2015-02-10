var Lobby = {
    players: [],
    localPlayerNumber: 0,

    reset: function () {
        this.players = [];

        if (Net.isHost) {
            this.localPlayerNumber = this.fillPlayerSlot(null);
        }

        this.syncUi();
    },

    getPlayerByNumber: function (no) {
        for (var i = 0; i < this.players.length; i++) {
            var player = this.players[i];

            if (player.number === no) {
                return player;
            }
        }

        return null;
    },

    getPlayerByConnection: function (connectionId) {
        if (!Net.isHost) {
            return null;
        }

        for (var i = 0; i < this.players.length; i++) {
            var player = this.players[i];

            if ((player.connection == null && connectionId == null) ||
                (connectionId != null && player.connection != null && player.connection.id === connectionId)) {
                return player;
            }
        }

        return null;
    },

    fillPlayerSlot: function (connection) {
        if (!Net.isHost) {
            return false;
        }

        for (var i = 1; i <= 4; i++) {
            if (this.getPlayerByNumber(i)) {
                continue;
            }

            var player = new Player(connection, i);
            this.players.push(player);
            return i;
        }

        return false;
    },

    onUserConnected: function (connection) {
        if (!Net.isHost) {
            return;
        }

        this.fillPlayerSlot(connection);

        this.syncUi();
        this.syncNetworkOut();
    },

    onUserDisconnected: function (connection) {
        if (!Net.isHost) {
            return;
        }

        var player = this.getPlayerByConnection(connection);
        var idx = this.players.indexOf(player);
        this.players.splice(idx, 1);

        this.syncUi();
        this.syncNetworkOut();
    },

    syncUi: function () {
        var $lobby = $('.lobby');

        for (var playerNo = 1; playerNo <= 4; playerNo++) {
            var $player = $lobby.find('.player.p' + playerNo);
            var $h4 = $player.find('h4');

            var player = this.getPlayerByNumber(playerNo);

            if (player == null) {
                $h4.text('Searching...');
            } else {
                $h4.text(this.localPlayerNumber == player.number ? 'CHOOSE A CHARACTER' : 'JOINED!');
            }
        }
    },

    syncNetworkOut: function () {
        if (!Net.isHost) {
            return;
        }

        var playerData = [];

        for (var i = 0; i < this.players.length; i++) {
            var player = this.players[i];

            playerData.push({
                number: player.number,
                remoteId: player.connection == null ? null : player.connection.id,
                character: 'thedoctor'
            });
        }

        Net.broadcastMessage({
            op: Opcode.LOBBY,
            players: playerData
        });
    },

    syncNetworkIn: function (data) {
        if (Net.isHost) {
            return;
        }

        this.players = [];

        for (var i = 0; i < data.players.length; i++) {
            var player = data.players[i];

            var localPlayer = new Player(null, player.number);
            localPlayer.remoteId = player.remoteId;
            this.players.push(localPlayer);

            if (player.remoteId === Net.slotId) {
                this.localPlayerNumber = player.number;
            }
        }

        this.syncUi();
    },

    startGame: function () {
        if (!Net.isHost) {
            return;
        }

        var mapId = 'green';

        var gameStart = {
            op: Opcode.START_GAME,
            mapId: mapId
        };

        Net.broadcastMessage(gameStart);
        Router.processData(gameStart);
    }
};