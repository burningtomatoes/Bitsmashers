var Router = {
    processData: function (data) {
        if (Net.isHost) {
            return;
        }

        var op = data.op;

        switch (op) {
            case Opcode.WELCOME:
                Net.slotId = data.yourId;
                console.info('[Lobby] We are now officially connected & communicating. Our network ID is', Net.slotId);
                break;
            case Opcode.LOBBY:
                Lobby.syncNetworkIn(data);
                break;
        }
    }
};