var WebRtc = {
    PEER_CONNECTION:        window.mozRTCPeerConnection         ||      window.webkitRTCPeerConnection,
    ICE_CANDIDATE:          window.mozRTCIceCandidate           ||      window.RTCIceCandidate,
    SESSION_DESCRIPTION:    window.mozRTCSessionDescription     ||      window.RTCSessionDescription,

    connected: false,

    init: function () {
        if (this.PEER_CONNECTION == null || this.ICE_CANDIDATE == null || this.SESSION_DESCRIPTION == null) {
            console.error('[Net] WebRTC is not (fully) supported in this browser. Networked multiplayer will not work!');
            return;
        }

        var browserMode = this.PEER_CONNECTION == window.mozRTCPeerConnection ? 'Firefox' : 'Chrome/WebKit';
        console.info('[Net] Initializing netcode (browser mode: ' + browserMode + ')...');

        this.initPeerConnection();
    },

    disconnect: function () {
        if (!this.connected) {
            return;
        }

        this.connected = false;
    },

    peerConnection: null,
    sdpOffer: null,

    createPeerConfig: function () {
        return {
            "iceServers": window.iceServers
        };
    },

    createDataChannelConfig: function () {
        return {
            "optional": [{
                RtpDataChannels: false
            }]
        };
    },

    initPeerConnection: function () {
        // Initialize the peer connection with our ICE servers
        this.peerConnection = new WebRtc.PEER_CONNECTION(this.createPeerConfig(), this.createDataChannelConfig());

        // Prepare to negotiate ICE servers
        this.peerConnection.onicecandidate = function (e) {
           console.log('On ICE Candidate:', e);
        };

        // Configure the data channel for this connection
        var dataChannel = this.peerConnection.createDataChannel('data_channel', {
            reliable: false
        });

        // Prepare our offer to submit to matchmaking
        this.createOffer();
    },

    createOffer: function () {
        this.peerConnection.createOffer(function (offer) {
            console.log(offer);
            this.peerConnection.setLocalDescription(new WebRtc.SESSION_DESCRIPTION(offer));
            this.sdpOffer = offer;
        }.bind(this), function (e) {
            console.error('[Net] Could not create offer:', e);
        });
    },

    createResponse: function (offerSdp) {
        var offer = {
            sdp: offerSdp,
            type: 'offer'
        };

        var sessionDescription = new WebRtc.SESSION_DESCRIPTION(offer);
        this.peerConnection.setRemoteDescription(sessionDescription, function () {
            console.log('hi');
            this.peerConnection.createAnswer(function(answer) {
                console.log(answer);
            }, function (e) {
                console.error('[Net] Could not create answer to offer!', e);
            })
        }.bind(this), function (e) {
            console.error('[Net] Could not set remote description!', e);
        });
    }
};