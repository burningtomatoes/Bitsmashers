var NetworkStatus = {
    NOT_SUPPORTED:      'not_supported',
    CREATING_SESSION:   'mm_connecting',
    IDLE:               'mm_connected',
    HOSTING_GAME:       'mm_hosting',
    JOINING_GAME:       'mm_joining'
};

var Network = {
    status: NetworkStatus.CREATING_SESSION,
    retrying: false,

    init: function () {
        WebRtc.init();

        if (!WebRtc.available) {
            this.status = NetworkStatus.NOT_SUPPORTED;
            this.syncUi();
            return;
        }

        this.status = NetworkStatus.CREATING_SESSION;

        Matchmaking.onHandshake = function (sessionId) {
            if (sessionId == null) {
                this.retryHandshake();
            } else {
                this.status = NetworkStatus.IDLE;
            }

            this.syncUi();
        }.bind(this);

        Matchmaking.handshake();

        this.syncUi();
    },

    retryHandshake: function () {
        this.retrying = true;

        window.setTimeout(function () {
            Matchmaking.handshake();
        }, 5000);
    },

    syncUi: function () {
        if (this.status == NetworkStatus.NOT_SUPPORTED) {
            MainMenu.showConnectNotice('Your browser does not support WebRTC, sorry.');
        } else if (this.status == NetworkStatus.CREATING_SESSION) {
            if (!this.retrying) {
                MainMenu.showConnectNotice('Connecting to BurningTomato.com matchmaking...');
            } else {
                MainMenu.showConnectNotice('Having trouble connecting to matchmaking service...');
            }
        } else if (this.status == NetworkStatus.HOSTING_GAME) {
            MainMenu.showConnectNotice('Preparing to host a game...');
        } else if (this.status == NetworkStatus.JOINING_GAME) {
            MainMenu.showConnectNotice('Searching for games to join...');
        } else {
            MainMenu.hideConnectNotice();
        }
    },

    isBusy: function () {
        return this.status != NetworkStatus.IDLE;
    },

    hostGame: function () {
        if (this.isBusy()) {
            return;
        }

        this.status = NetworkStatus.HOSTING_GAME;
        this.syncUi();

        WebRtc.initPeerConnection();
        WebRtc.createOffer(function (offer) {
            if (offer == null) {
                MainMenu.showConnectNotice('Could not host a game!');
            } else {
                Matchmaking.beginOfferingGame();
            }
        }.bind(this));
    },

    joinGame: function () {
        if (this.isBusy()) {
            return;
        }

        this.status = NetworkStatus.JOINING_GAME;
        this.syncUi();

        WebRtc.initPeerConnection();
        Matchmaking.beginLookingForGame();
    }
};