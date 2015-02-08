var Matchmaking = {
    Opcode: {
        DISCONNECT: 'disconnect',
        HANDSHAKE: 'handshake',
        OFFER: 'offer',
        ANSWER: 'answer',
        CANCEL_OFFER: 'cancelOffer'
    },

    sessionId: null,

    onHandshake: function() { },

    send: function (payload, callback, reference) {
        if (callback == null) {
            callback = function () { };
        }

        $.post(Settings.MatchmakingUri, payload)
        .success(function(data) {
            callback(data, reference);
        })
        .error(function() {
            callback(null, reference);
        });
    },

    handshake: function () {
        this.sessionId = null;

        $('#matchmaking').text('Connecting...');

        // Generate a unique GUID that identifies our client. We use this to keep track of which browser instance
        // created which games. This prevents us trying to connect to old instances of ourselves.
        var ourGuid = localStorage.getItem('bs_net_id');

        if (ourGuid == null) {
            ourGuid = Utils.generateGuid();
            localStorage.setItem('bs_net_id', ourGuid);
        }

        var payload = {
            op: Matchmaking.Opcode.HANDSHAKE,
            game: 'bitsmashers',
            build: Game.buildCode,
            client_descriptor: ourGuid
        };

        var callback = function (data) {
            if (data == null || data.code != 'OK') {
                console.error('[Net] Matchmaking server is not available. Received bad handshake response: ', data);
                this.onHandshake(null);
                return;
            }

            this.sessionId = parseInt(data.session);
            console.info('[Net] Handshake with matchmaking server complete - session #' + this.sessionId);

            this.onHandshake(this.sessionId);
        }.bind(this);

        this.send(payload, callback);
    },

    disconnect: function () {
        if (this.sessionId == null) {
            return;
        }

        var payload = {
            op: Matchmaking.Opcode.DISCONNECT
        };

        this.send(payload);
    },

    sendOfferInterval: null,

    sendOfferAndAwait: function () {
        window.clearInterval(this.sendOfferInterval);
        window.clearInterval(this.sendAnswerInterval);

        if (this.candidate != null) {
            console.info('[Net] Resuming matchmaking, ignoring candidate #' + this.candidate.id + ' from now on.');

            this.failedCandidates.push(this.candidate.id);
            this.candidate = null;
        }

        var doOffer = function () {
            if (WebRtc.sdpOffer == null) {
                // Wait for our WebRTC offer to be ready
                return;
            }

            var payload = {
                session: this.sessionId,
                op: Matchmaking.Opcode.OFFER,
                sdp_offer: WebRtc.sdpOffer.sdp
            };

            $('#matchmaking').text('Matchmaking...');

            this.send(payload, function (data) {
                if (data.candidate != null) {
                    this.processCandidate(data.candidate);
                }
            }.bind(this));
        }.bind(this);

        console.info('[Net] Sending offer to matchmaking service, awaiting response...');
        this.sendOfferInterval = window.setInterval(doOffer, 3500);
        doOffer();
    },

    sendAnswerInterval: null,
    candidate: null,
    failedCandidates: [],

    processCandidate: function (candidate) {
        if (candidate.sdp_offer == null) {
            return;
        }

        if (this.failedCandidates.indexOf(candidate.id) >= 0) {
            // We don't like this candidate.
            return;
        }

        this.candidate = candidate;

        $('#matchmaking').text('Found a candidate #' + candidate.id + '...');
        console.info('[Net] Found a potential candidate: #' + candidate.id + ', negotiating connection...');

        this.sendAnswerAndAwait();
    },

    sendAnswerAndAwait: function () {
        if (this.candidate == null) {
            return;
        }

        window.clearInterval(this.sendOfferInterval);
        window.clearInterval(this.sendAnswerInterval);

        var doAnswer = function () {
            WebRtc.createResponse(this.candidate.sdp_offer);

            var payload = {
                op: Matchmaking.Opcode.ANSWER,
                session: this.sessionId,
                candidate: this.candidate.id
            };

            this.send(payload, function (data) {
                if (data.error) {
                    console.warn('[Net] Answer to candidate failed:', data.error);
                    this.sendOfferAndAwait();
                }
            }.bind(this));
        }.bind(this);

        //this.sendAnswerInterval = window.setInterval(doAnswer, 3500);
        doAnswer();
    },

    cancelOffer: function (callback) {

    }
};

window.onbeforeunload = function() {
    Matchmaking.disconnect();
};