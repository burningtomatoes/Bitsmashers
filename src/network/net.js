var Net = {
    isHost: false,
    busy: false,

    slotId: 0,

    connections: [],

    init: function () {
        Matchmaking.connect();

        this.reset();

        window.setInterval(this.doOffer.bind(this), 2500);
    },

    reset: function () {
        this.isHost = false;
        this.busy = false;
        this.connections = [];
    },

    offerFound: function (offerData) {
        if (!this.busy || !this.isHost) {
            // We are not hosting a game, we are not interested in offers right now.
            return;
        }

        if (Game.inGame) {
            // Do not accept new offers while in game.
            return;
        }

        if (this.alreadyKnowConnection(offerData.connectionId)) {
            // We already know this peer, do not open another connection to it.
            return;
        }

        var freeConnection = this.getFreeConnection();

        if (freeConnection == null) {
            // We do not have a free connection that can respond to this.
            return;
        }

        freeConnection.remoteId = offerData.connectionId;

        var answer = freeConnection.createAnswer(offerData.offer, function (result) {
            if (result == null) {
                // Failed to create an answer for w/e reason, reset this connection.
                freeConnection.reset();
                return;
            }

            Matchmaking.sendAnswer(result, offerData.connectionId);
        })
    },

    getConnectionBySessionId: function (connId) {
        for (var i = 0; i < this.connections.length; i++) {
            var connection = this.connections[i];

            if (connection.remoteId == connId) {
                return connection;
            }
        }

        return null;
    },

    alreadyKnowConnection: function (connId) {
        return this.getConnectionBySessionId(connId) != null;
    },

    answerFound: function (answerData) {
        if (!this.busy || this.isHost) {
            return;
        }

        var connection = this.getConnection();

        if (connection == null || connection.isBeingAnswered || connection.isAnswering) {
            return;
        }

        MainMenu.showConnectNotice('Trying to join game (' + answerData.connectionId + ')...');

        connection.processAnswer(answerData.answer, function (result) {
            if (result == null) {
                // Unable to process answer, try resetting the connection...
                connection.reset();
            } else {
                connection.remoteId = answerData.connectionId;
            }
        });
    },

    iceReceived: function (iceData) {
        if (!this.busy) {
            return;
        }

        var conn = this.getConnectionBySessionId(iceData.connectionId);

        if (conn == null || conn.isLive) {
            return;
        }

        conn.processIceCandidate(iceData.candidate);
    },

    getFreeConnection: function () {
        if (!this.isHost) {
            return null;
        }

        for (var i = 0; i < this.connections.length; i++) {
            var connection = this.connections[i];

            if (connection.isAnswering || connection.isBeingAnswered) {
                continue;
            }

            return connection;
        }

        return null;
    },

    hostGame: function () {
        if (this.busy) {
            return;
        }

        this.reset();

        this.isHost = true;
        this.busy = true;

        Lobby.reset();

        // We are the host. Await offers that we see, and send answers to them as we go.
        // Begin by preparing three peer connections.
        for (var i = 0; i < 3; i++) {
            this.prepareConnection(i);
        }

        // Wait for matchmaking calls to come in...
        MainMenu.showConnectNotice('Hosting a game. Waiting for players...');
    },

    joinGame: function () {
        if (this.busy) {
            return;
        }

        this.reset();

        this.isHost = false;
        this.busy = true;

        Lobby.reset();

        // We are trying to join an existing game. Send an offer into the sky and hope someone will respond.
        // Begin by preparing our local connection.
        this.prepareConnection(0);

        // Prepare our message, then submit it to matchmaking, and hope that someone finds us.
        MainMenu.showConnectNotice('...');

        this.getConnection().createOffer(function (offer) {
            this.doOffer();
        }.bind(this));
    },

    doOffer: function () {
        if (!this.busy || this.isHost) {
            return;
        }

        var conn = this.getConnection();

        if (conn == null || conn.offer == null || conn.isAnswering || conn.remoteId != null) {
            return;
        }

        Matchmaking.sendOffer(conn.offer);
        MainMenu.showConnectNotice('Looking for a game...');
    },

    prepareConnection: function (id) {
        this.connections[id] = new WebRtcConnection(id);
    },

    getConnection: function (id) {
        if (id == null) {
            id = 0;
        }

        return this.connections[id];
    },

    broadcastMessage: function (message) {
        if (!this.isHost) {
            this.sendMessageTo(0, message);
            return;
        }

        for (var i = 0; i < this.connections.length; i++) {
            var conn = this.connections[i];
            conn.sendMessage(message);
        }
    },

    sendMessageTo: function (id, message) {
        for (var i = 0; i < this.connections.length; i++) {
            var conn = this.connections[i];

            if (conn.id === id) {
                conn.sendMessage(message);
                return true;
            }
        }

        return false;
    },

    onUserConnected: function (connection) {
        if (!Net.isHost) {
            return;
        }

         var welcomeMessage = {
             op: Opcode.WELCOME,
             hello: "Hi there!",
             yourId: connection.id
         };

        this.sendMessageTo(connection.id, welcomeMessage);

        Lobby.onUserConnected(connection);
    },

    onUserDisconnected: function (connection) {
        if (!Net.isHost) {
            return;
        }

        Lobby.onUserDisconnected(connection);

        connection.reset();
    }
};