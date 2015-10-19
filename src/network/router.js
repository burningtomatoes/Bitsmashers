var Router = {
    processData: function (data, connection) {
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
            case Opcode.THROW:
                if (Net.isHost && data.r !== 1) {
                    data.r = 1;
                    Net.broadcastMessage(data);
                }

                var e = Game.stage.getPlayerByNumber(data.p);
                e.doThrow(true);
                break;
            case Opcode.GO:
                Log.clear();
                Game.unfreeze();
                $('#go').show().text('Go!').delay(1000).fadeOut('slow');
                Game.stage.unlock();
                Camera.followEntity(Game.stage.player);
                AudioOut.playSfx('startshot.wav', 0.25);
                $('#scoreboard').hide();
                break;
            case Opcode.ROUND_FINISH:
                Game.stage.lock();
                Game.freeze();

                Camera.followEntity(Game.stage.player);

                Scoreboard.prepareScoreboard();

                $('#go, #uded, #hud').hide();
                $('#scoreboard').delay(500).fadeIn('fast');
                $('#game').delay(2500).fadeOut(1000);
                break;
            case Opcode.DEATH:
                var pNo = data.playerNumber;
                var entity = Game.stage.getPlayerByNumber(pNo);
                entity.die(true);

                if (Net.isHost && !data.b) {
                    // This was a message sent by a client themselves, and was not broadcast by the host
                    // Rebroadcast it to all clients
                    data.b = true;
                    Net.broadcastMessage(data);
                }

                break;
            case Opcode.BLOCK_SMASH:
                if (Net.isHost) {
                    // Rebroadcast to clients
                    Net.broadcastMessage(data);
                }

                // Smash block locally
                var b = Game.stage.getEntityById(data.i);

                if (b != null && b.isBlock) {
                    b.smash(true);
                }

                break;
            case Opcode.SCOREBOARD:
                if (Net.isHost) {
                    return;
                }
                Scoreboard.syncScoresIn(data);
                break;
            case Opcode.LOAD_COMPLETE_NOTIFY:
                if (!Net.isHost || connection == null) {
                    return;
                }
                var remotePlayer = Lobby.getPlayerByConnectionId(connection.id);
                if (remotePlayer != null) {
                    Rounds.setLoadReady(remotePlayer);
                }
                break;
            default:
                console.warn('[Net:Router] Unable to route message, unknown op', op);
                break;
        }
    }
};