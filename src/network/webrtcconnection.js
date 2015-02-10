window.PeerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
window.IceCandidate = window.mozRTCIceCandidate || window.RTCIceCandidate;
window.SessionDescription = window.mozRTCSessionDescription || window.RTCSessionDescription;

var WebRtcConnection = Class.extend({
    id: null,
    peerConnection: null,
    dataChannel: null,
    offer: null,

    isAnswering: false,
    isBeingAnswered: false,

    remoteId: null,

    isLive: false,

    timeoutCheck: null,

    aliveChecksFailed: 0,

    init: function (id) {
        this.id = id;

        this.offer = null;
        this.isAnswering = false;
        this.isBeingAnswered = false;
        this.isLive = false;
        this.aliveChecksFailed = 0;

        this.peerConnection = new PeerConnection({
            "iceServers": window.iceServers
        });
        this.peerConnection.onicecandidate = function (e) {
            if (this.remoteId == null) {
                // We do not have a partner to send our ICE candidates to yet...
                return;
            }

            if (e.candidate) {
                Matchmaking.sendIce(e.candidate, this.remoteId);
            }
        }.bind(this);

        this.peerConnection.ondatachannel = function (e) {
            console.info('[Net:Rtc][#' + this.id + '] Received remote data channel.');

            e.channel.onmessage = function (e) {
                var parsed = JSON.parse(e.data);
                console.info('[Net:Rtc][#' + this.id + '] Received data', parsed);
                Router.processData(parsed);
            }.bind(this);
        }.bind(this);

        this.dataChannel = this.peerConnection.createDataChannel('dc' + id, { reliable: false });
        this.dataChannel.onopen = function (e) {
            this.isLive = true;
            console.info('[Net:Rtc][#' + this.id + '] Data channel is now open. Connection is now live!');
            Net.onUserConnected(this);
        }.bind(this);
        this.dataChannel.onclose = function (e) {
            this.isLive = false;
            console.error('[Net:Rtc][#' + this.id + '] Data channel was closed. Connection is now dead.');
            Net.onUserDisconnected(this);
        }.bind(this);
        this.dataChannel.onerror = function (error) {
            console.error('[Net:Rtc][#' + this.id + '] Data channel error:', error);
        }.bind(this);

        window.setInterval(this.checkAlive.bind(this), 5000);
    },

    onDataOpen: function () {

    },

    sendMessage: function (data) {
        if (!this.isLive) {
            return;
        }

        this.dataChannel.send(JSON.stringify(data));
    },

    checkAlive: function () {
        console.log('ca');
        if (this.isLive) {
            try {
                this.dataChannel.send('0');
            } catch (e) { }
        }

        if ((this.isAnswering || this.isBeingAnswered) && !this.isLive) {
            this.aliveChecksFailed++;

            if (this.aliveChecksFailed >= 3) {
                console.error('[Net:Rtc][#' + this.id + '] This connection does not appear to be responding, resetting (keep alive failed)');
                this.reset();
            }
        } else {
            this.aliveChecksFailed = 0;
        }
    },

    reset: function () {
        window.clearInterval(this.timeoutCheck);
        this.init(this.id);
    },

    createOffer: function (callback) {
        this.peerConnection.createOffer(function (offer) {
            console.info('[Net:Rtc][#' + this.id + '] Prepared SDP offer', offer);

            this.offer = offer;
            this.peerConnection.setLocalDescription(new SessionDescription(offer));

            callback(offer);
        }.bind(this), function (error) {
            console.error('[Net:Rtc][#' + this.id + '] Could not create offer', error);

            callback(null);
        }.bind(this));
    },

    createAnswer: function (offer, callback) {
        this.isAnswering = true;
        this.isBeingAnswered = false;

        this.peerConnection.setRemoteDescription(new SessionDescription(offer), function () {
            this.peerConnection.createAnswer(function (answer) {
                console.info('[Net:Rtc][#' + this.id + '] Created answer', answer);
                this.peerConnection.setLocalDescription(answer);
                callback(answer);
            }.bind(this), function (error) {
                console.error('[Net:Rtc][#' + this.id + '] Could not create answer (resetting connection)', error);
                this.isAnswering = false;
                callback(null);
            }.bind(this));
        }.bind(this), function (error) {
            console.error('[Net:Rtc][#' + this.id + '] Could not set remote description - can not produce an answer', error);
            this.isAnswering = false;
            callback(null);
        }.bind(this));
    },

    processAnswer: function (answer, callback) {
        this.isAnswering = false;
        this.isBeingAnswered = true;

        this.peerConnection.setRemoteDescription(new SessionDescription(answer), function () {
            console.info('[Net:Rtc][#' + this.id + '] Accepted remote answer!', answer);
            callback(true);
        }.bind(this), function (error) {
            console.error('[Net:Rtc][#' + this.id + '] Could not set remote description - can not produce an answer', error);
            this.isBeingAnswered = false;
            callback(null);
        }.bind(this));
    },

    processIceCandidate: function (candidate) {
        if (this.isLive) {
            return;
        }

        this.peerConnection.addIceCandidate(new IceCandidate(candidate));
    }
});