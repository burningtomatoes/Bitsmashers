var Matchmaking = {
    socket: null,
    didHandshake: false,
    isConnecting: false,
    connectionId: null,

    connect: function () {
        if (this.isConnecting) {
            return;
        }

        this.didHandshake = false;
        this.isConnecting = true;

        console.info('[Net:Match] Connnecting to matchmaking service at ' + Settings.MatchmakingUri + '.');
        MainMenu.showConnectNotice('Connecting to matchmaking service...');

        try {
            this.socket = io.connect(Settings.MatchmakingUri);

            this.socket.on('handshake', this.onHandshake.bind(this));
            this.socket.on('offer', this.onOffer.bind(this));
            this.socket.on('answer', this.onAnswer.bind(this));
            this.socket.on('ice', this.onIce.bind(this));
            this.socket.on('disconnect', this.disconnect.bind(this));

            this.socket.emit('handshake');
        } catch (e) {
            this.isConnecting = false;
            console.error('[Net:Match] Could not connect to service!', e);
            this.disconnect(true);
        }
    },

    onHandshake: function (data) {
        this.isConnecting = false;
        this.didHandshake = true;
        this.connectionId = data.id;
        console.info('[Net:Match] Connected successfully. Handshake complete. Session #', data.id);
        MainMenu.showConnectNotice(data.motd);
    },

    onOffer: function (data) {
        Net.offerFound(data);
    },

    onAnswer: function (data) {
        Net.answerFound(data);
    },

    onIce: function () {
        // ...
    },

    offerRepeat: null,

    sendOffer: function (offer) {
        this.socket.emit('offer', offer);
    },

    sendAnswer: function (answer, connectionId) {
        var payload = {
            answer: answer,
            connectionId: connectionId
        };

        console.log(payload);

        this.socket.emit('answer', payload);
    },

    disconnect: function (reconnect) {
        this.isConnecting = false;

        if (this.socket == null) {
            if (reconnect) {
                this.connect();
            }

            return;
        }

        console.info('[Net:Match] Disconnecting from matchmaking service.');
        MainMenu.showConnectNotice('Disconnected from matchmaking.');

        try {
            this.socket.disconnect();
        } catch (e) { }

        this.socket = null;

        if (reconnect) {
            this.connect();
        }
    },

    isConnected: function () {
        return this.socket != null && this.socket.connected;
    }
};