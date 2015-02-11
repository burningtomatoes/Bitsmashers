var Router = {
    processData: function (data) {
        var op = data.op;

        switch (op) {
            case Opcode.WELCOME:
                if (Net.isHost) {
                    break;
                }
                Net.slotId = data.yourId;
                console.info('[Lobby] We are now officially connected & communicating. Our network ID is', Net.slotId);
                MainMenu.showConnectNotice('Joined game! Choose a character.');
                break;
            case Opcode.LOBBY:
                if (Net.isHost) {
                    break;
                }
                Lobby.syncNetworkIn(data);
                break;
            case Opcode.START_GAME:
                Game.loadStage(data.mapId);
                break;
            case Opcode.PLAYER_LIST:
                if (Net.isHost) {
                    break;
                }
                Game.stage.syncPlayersIn(data);
                break;
            case Opcode.PLAYER_UPDATE:
                if (Net.isHost && data.r !== 1) {
                    data.r = 1;
                    Net.broadcastMessage(data);
                }

                var e = Game.stage.getPlayerByNumber(data.p);
                e.applySyncMessage(data);
                break;
            default:
                console.warn('[Net:Router] Unable to route message, unknown op', op);
                break;
        }
    }
};