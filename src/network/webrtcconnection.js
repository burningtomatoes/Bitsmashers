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

    init: function (id) {
        this.id = id;

        this.offer = null;
        this.isAnswering = false;
        this.isBeingAnswered = false;

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

        this.dataChannel = this.peerConnection.createDataChannel('dc' + id);
        this.dataChannel.onopen = function () {
            console.warn('!!!!!!!!!!!!!!!!!!!! THE DATA CHANNEL IS NOW OPEN MOTHAF#!@#A');
        };
    },

    reset: function () {
        this.init();
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
        this.peerConnection.addIceCandidate(new IceCandidate(candidate));
    }
});