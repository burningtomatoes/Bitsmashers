var Stage = Class.extend({
    isStage: true,

    id: null,
    width: 0,
    height: 0,

    entities: [],
    toRemove: [],

    backgroundImage: null,

    player: null,

    gravity: 0.5,

    init: function () {
        this.clear();
    },

    clear: function () {
        this.entities = [];
        this.toRemove = [];
    },

    add: function (entity) {
        if (this.entities.indexOf(entity) == -1) {
            entity.map = this;
            this.entities.push(entity);
        }
    },

    setPlayer: function (entity) {
        this.add(entity);
        this.player = entity;
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

    draw: function (ctx) {
        // Draw background image, if one was configured
        {
            if (this.backgroundImage) {
                var w = Canvas.canvas.width;
                var h = Canvas.canvas.height;
                var x = Camera.rumbleOffset;
                var y = Camera.rumbleOffset;

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

                if (entity.isPlayer) {
                    continue;
                }

                entity.draw(ctx);
            }
        }
    },

    update: function () {
        // Process all pending entity removals
        {
            for (var i = 0; i < this.toRemove.length; i++) {
                var removeEntity = this.toRemove[i];
                var entityIdx = this.entities.indexOf(removeEntity);

                if (entityIdx === -1) {
                    continue;
                }

                this.entities.splice(entityIdx, 1);
            }

            this.toRemove = [];
        }

        // Process all entities on the map
        {
            for (var j = 0; j < this.entities.length; j++) {
                var entity = this.entities[j];
                entity.update();
            }
        }
    }
});