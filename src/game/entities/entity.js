var Direction = {
    RIGHT: 0,
    LEFT: 1
};

var Entity = Class.extend({
    isEntity: true,

    receivesDamage: true,
    causesTouchDamage: false,

    causesCollision: true,
    receivesCollision: true,
    affectedByGravity: true,

    posX: 0,
    posY: 0,

    height: 0,
    width: 0,

    velocityX: 0,
    velocityY: 0,
    direction: 0,

    map: null,

    renderer: null,

    init: function () {
        this.posX = 0;
        this.posY = 0;
        this.map = null;
        this.height = 32;
        this.width = 32;
        this.velocityX = 0;
        this.velocityY = 0;
        this.renderer = null;
        this.direction = Direction.RIGHT;
    },

    isMoving: function () {
        return this.velocityX != 0 || this.velocityY != 0;
    },

    isFalling: function () {
        return this.velocityY > 0;
    },

    isJumping: function () {
        return this.velocityY < 0;
    },

    stopMoving: function () {
        this.velocityX = 0;
        this.velocityY = 0;
    },

    update: function () {
        this.posX += this.velocityX;
        this.posY += this.velocityY;

        if (this.velocityX != 0) {
            this.direction = this.velocityX < 0 ? Direction.LEFT : Direction.RIGHT;
        }

        if (this.affectedByGravity) {
            this.velocityY += this.map.gravity;

            if (this.velocityY >= this.height) {
                this.velocityY = this.height;
            }
        }

        if (this.renderer != null) {
            this.renderer.update();
        }
    },

    draw: function (ctx) {
        if (this.renderer != null) {
            this.renderer.draw(ctx);
        }
    },

    rect: function () {
        var r = { };
        r.width = this.width;
        r.height = this.height;
        r.left = this.posX;
        r.top = this.posY;
        r.right = r.left + r.width;
        r.bottom = r.top + r.height;
        return r;
    }
});