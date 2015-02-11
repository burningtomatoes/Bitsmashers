var Stage = Class.extend({
    isStage: true,

    id: null,
    width: 0,
    height: 0,

    entities: [],
    toRemove: [],

    backgroundImage: null,

    player: null,
    playerSpawns: [],

    gravity: 0.5,

    unlocked: false,
    unlockTimer: 0,

    idGen: 0,

    init: function () {
        this.clear();
    },

    clear: function () {
        this.entities = [];
        this.toRemove = [];
        this.unlocked = false;
    },

    beginCountdown: function () {
        if (!Net.isHost) {
            return;
        }

        this.unlocked = false;
        this.unlockTimer = 120;
    },

    add: function (entity) {
        if (this.entities.indexOf(entity) == -1) {
            entity.map = this;
            entity.id = this.idGen++;
            this.entities.push(entity);
        }
    },

    getEntityById: function (id) {
        for (var i = 0; i < this.entities.length; i++) {
            var entity = this.entities[i];

            if (entity.id === id) {
                return entity;
            }
        }

        return null;
    },

    setPlayer: function (entity) {
        this.add(entity);
        this.player = entity;
    },

    getPlayerByNumber: function (no) {
        for (var i = 0; i < this.entities.length; i++) {
            var entity = this.entities[i];

            if (!entity.isPlayer) {
                continue;
            }

            if (entity.playerNumber === no) {
                return entity;
            }
        }

        return null;
    },

    remove: function (entity) {
        if (this.entities.indexOf(entity) == -1) {
            return false;
        }

        if (this.toRemove.indexOf(entity) === -1) {
            this.toRemove.push(entity);
            return true;
        }

        return false;
    },

    checkCollisions: function (ourEntity, ourRect) {
        if (ourRect == null) {
            ourRect = ourEntity.rect();
        }

        var results = [];

        for (var i = 0; i < this.entities.length; i++) {
            var entity = this.entities[i];

            if (entity === ourEntity || !entity.causesCollision) {
                continue;
            }

            var theirRect = entity.rect();

            if (Utils.rectIntersects(ourRect, theirRect)) {
                results.push(entity);
            }
        }

        return results;
    },

    anyCollisions: function (ourEntity, ourRect) {
        var cols = this.checkCollisions(ourEntity, ourRect);
        return cols.length > 0;
    },

    draw: function (ctx) {
        // Draw background image, if one was configured
        {
            if (this.backgroundImage) {
                var w = Canvas.canvas.width;
                var h = Canvas.canvas.height;
                var x = Camera.rumbleOffset / 5;
                var y = Camera.rumbleOffset / 5;

                ctx.drawImage(this.backgroundImage, 0, 0, w, h, x, y, w, h);
            }
        }

        // Draw all non-player entities on the map
        {
            for (var i = 0; i < this.entities.length; i++) {
                var entity = this.entities[i];

                if (entity.isPlayer) {
                    continue;
                }

                entity.draw(ctx);
            }
        }

        // Draw all players. We draw them last so they are on top.
        {
            for (var j = 0; j < this.entities.length; j++) {
                var entity = this.entities[j];

                if (!entity.isPlayer) {
                    continue;
                }

                entity.draw(ctx);
            }
        }
    },

    processRemovals: function () {
        for (var i = 0; i < this.toRemove.length; i++) {
            var removeEntity = this.toRemove[i];
            var entityIdx = this.entities.indexOf(removeEntity);

            if (entityIdx === -1) {
                continue;
            }

            this.entities.splice(entityIdx, 1);
        }

        this.toRemove = [];
    },

    update: function () {
        // Process all pending entity removals
        this.processRemovals();

        // Process all entities on the map
        {
            for (var j = 0; j < this.entities.length; j++) {
                var entity = this.entities[j];
                entity.update();
            }
        }

        // Countdown to GO
        if (Net.isHost && !this.unlocked)
        {
            if (this.unlockTimer > 0) {
                this.unlockTimer--;

                if (this.unlockTimer <= 0) {
                    var mGo = { op: Opcode.GO };

                    Net.broadcastMessage(mGo);
                    Router.processData(mGo);
                }
            }
        }
    },

    syncPlayersOut: function () {
        var playerData = [];

        for (var i = 0; i < this.entities.length; i++) {
            var entity = this.entities[i];

            if (!entity.isPlayer) {
                continue;
            }

            playerData.push({
                fighter: entity.fighterType,
                posX: entity.posX,
                posY: entity.posY,
                playerNumber: entity.player.number
            });
        }

        var payload = {
            op: Opcode.PLAYER_LIST,
            players: playerData
        };

        Net.broadcastMessage(payload);
    },

    syncPlayersIn: function (data) {
        // Despawn any players on the map
        for (var i = 0; i < this.entities.length; i++) {
            var entity = this.entities[i];

            if (!entity.isPlayer) {
                continue;
            }

            this.toRemove.push(entity);
        }

        this.processRemovals();

        // Spawn players anew
        for (var i = 0; i < data.players.length; i++) {
            var playerData = data.players[i];

            var fighter = new TheDoctorFighter();
            fighter.posX = playerData.posX;
            fighter.posY = playerData.posY;
            fighter.playerNumber = playerData.playerNumber;

            this.add(fighter);

            if (fighter.playerNumber === Lobby.localPlayerNumber) {
                this.setPlayer(fighter);
            }
        }
    }


});