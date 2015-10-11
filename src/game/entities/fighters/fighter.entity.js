var Fighters = {
    TheDoctor: 'thedoctor'
};

var FighterEntity = Entity.extend({
    isPlayer: true,
    isFighter: true,

    fighterType: null,

    xMargin: 0,
    yMargin: 0,

    playerNumber: 0,

    isAttacking: false,

    dead: false,

    init: function () {
        this._super();

        this.posX = 170;
        this.posY = 100;

        this.xMargin = 0;
        this.yMargin = 0;

        this.playerNumber = 0;
        this.isAttacking = false;

        this.dead = false;
    },

    configureRenderer: function () {
        this.renderer = new FighterRenderer(this);
    },

    projectRect: function (x, y) {
        var r = this._super(x, y);

        r.top += this.yMargin;
        r.height -= this.yMargin;

        r.left += this.xMargin;
        r.width -= this.xMargin * 2;

        r.right = r.left + r.width;
        r.bottom = r.top + r.height;
        return r;
    },

    isLocalPlayer: function () {
        return (Game.stage.player === this);
    },

    prepareSyncMessage: function () {
        return {
            op: Opcode.PLAYER_UPDATE,
            p: this.playerNumber,
            x: this.posX,
            y: this.posY,
            vX: this.velocityX,
            vY: this.velocityY,
            a: this.isAttacking,
            aW: this.attackingWith != null ? this.attackingWith.id : null
        };
    },

    applySyncMessage: function (data) {
        this.posX = data.x;
        this.posY = data.y;
        this.velocityX = data.vX;
        this.velocityY = data.vY;
        this.isAttacking = data.a;

        if (data.aW != null) {
            if (this.attackingWith == null || this.attackingWith.id != data.aW) {
                this.attackingWith = Game.stage.getEntityById(data.aW);
            }
        } else {
            this.attackingWith = null;
        }
    },

    pickUp: function (entity) {
        this.isAttacking = true;
        this.attackingWith = entity;

        // Check if any other entities were trying to attack (steal)
        for (var i = 0; i < Game.stage.entities.length; i++) {
            var e = Game.stage.entities[i];

            if (e != this && e.isAttacking && e.attackingWith == this.attackingWith) {
                e.isAttacking = false;
                e.attackingWith = null;
                Log.writeMessage('Player ' + this.playerNumber + ' blocked Player ' + e.playerNumber + '!');
                e.forceDisableAttack = true;
                break;
            }
        }
    },

    update: function () {
        if (this.dead) {
            return;
        }

        if (this.forceDisableAttack) {
            this.isAttacking = false;
            this.attackingWith = null;
            this.forceDisableAttack = false;
        }

        this._super();

        if (this.isAttacking && this.attackingWith != null) {
            this.attackingWith.posX = this.posX;
            this.attackingWith.posY = this.rect().top - this.attackingWith.height;

            this.attackingWith.causesCollision = true;
            this.attackingWith.causesTouchDamage = false;
            this.attackingWith.receivesCollision = false;
            this.attackingWith.affectedByGravity = false;
        }

        if (Net.isHost && this.shouldDie()) {
            this.die();
        }
    },

    doThrow: function () {
        this.attackingWith.isProjectile = true;
        this.attackingWith.causesCollision = false;
        this.attackingWith.receivesCollision = true;
        this.attackingWith.affectedByGravity = true;
        this.attackingWith.velocityX = this.direction == Direction.LEFT ? -32 : 32;

        this.attackingWith = null;
        this.isAttacking = false;

        this.landed = true;
        this.jumped = false;

        var netPayload = {
            op: Opcode.THROW,
            p: this.playerNumber
        };

        if (Net.isHost) {
            Net.broadcastMessage(netPayload);
        } else {
            Net.getConnection().sendMessage(netPayload);
        }
    },

    shouldDie: function () {
        return this.posY >= Game.stage.height;
    },

    die: function () {
        if (this.dead) {
            return;
        }

        this.dead = true;
        AudioOut.playSfx('death.wav');

        this.causesCollision = false;
        this.receivesCollision = false;

        if (Net.isHost) {
            var payload = {
                op: Opcode.DEATH,
                playerNumber: this.playerNumber
            };

            Net.broadcastMessage(payload);
        }

        Log.writeMessage('Player ' + this.playerNumber + ' died!!');

        if (this.isLocalPlayer()) {
            Camera.centerToMap();
            $('#uded').show();
        }

        if (this.attackingWith != null) {
            Game.stage.remove(this.attackingWith);

            this.isAttacking = false;
            this.attackingWith = null;
        }

        this.map.remove(this);
    }
});