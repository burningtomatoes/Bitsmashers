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
    movementSpeed: 3,
    jumpPower: 4,

    jumped: false,
    landed: false,
    doubleJumped: false,

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
        this.jumped = false;
        this.landed = false;
        this.doubleJumped = false;
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
        if (this.willCollideUp() || this.willCollideDown()) {
            this.velocityY = 0;
        }
        if (this.willCollideLeft() || this.willCollideRight()) {
            this.velocityX = 0;
        }

        this.posX += this.velocityX;
        this.posY += this.velocityY;

        if (this.velocityX != 0) {
            this.direction = this.velocityX < 0 ? Direction.LEFT : Direction.RIGHT;
        }

        if (this.affectedByGravity) {
            if (this.canMoveDown()) {
                this.velocityY += this.map.gravity;
            }

            if (this.velocityY >= this.height) {
                this.velocityY = this.height;
            }
        }

        if (this.isJumping() && !this.canMoveUp()) {
            this.velocityY = 0;
        }

        if (this.isFalling() && !this.canMoveDown()) {
            this.velocityY = 0;
            this.landed = true;
            this.jumped = false;
            this.doubleJumped = false;
        }

        if (this.renderer != null) {
            this.renderer.update();
        }
    },

    draw: function (ctx) {
        if (this.renderer != null) {
            this.renderer.draw(ctx);
        }

        if (Settings.DebugCollision) {
            var sq = this.rect();

            ctx.beginPath();
            ctx.rect(Camera.translateX(sq.left), Camera.translateY(sq.top), sq.width, sq.height);
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'red';
            ctx.stroke();
        }
    },

    canMoveLeft: function () {
        if (!this.receivesCollision) {
            return true;
        }

        var projectedPosX = this.posX - this.movementSpeed;
        var projectedRect = this.projectRect(projectedPosX, null);
        return !Game.stage.anyCollisions(this, projectedRect);
    },

    canMoveRight: function () {
        if (!this.receivesCollision) {
            return true;
        }

        var projectedPosX = this.posX + this.movementSpeed;
        var projectedRect = this.projectRect(projectedPosX, null);
        return !Game.stage.anyCollisions(this, projectedRect);
    },

    canMoveUp: function () {
        if (!this.receivesCollision) {
            return true;
        }

        var projectedPosY = this.posY - this.movementSpeed;
        var projectedRect = this.projectRect(null, projectedPosY);
        return !Game.stage.anyCollisions(this, projectedRect);
    },

    canMoveDown: function () {
        if (!this.receivesCollision) {
            return true;
        }

        var projectedPosY = this.posY + this.movementSpeed;
        var projectedRect = this.projectRect(null, projectedPosY);
        return !Game.stage.anyCollisions(this, projectedRect);
    },

    canMoveAnywhere: function () {
        if (!this.receivesCollision) {
            return true;
        }

        return (this.canMoveLeft() || this.canMoveDown() || this.canMoveUp() || this.canMoveRight());
    },

    willCollideLeft: function () {
        if (!this.receivesCollision) {
            return false;
        }

        if (this.velocityX >= 0) {
            return false;
        }

        var projectedPosX = this.posX - this.velocityX;
        var projectedRect = this.projectRect(projectedPosX, null);
        return Game.stage.anyCollisions(this, projectedRect);
    },

    willCollideRight: function () {
        if (!this.receivesCollision) {
            return false;
        }

        if (this.velocityX <= 0) {
            return false;
        }

        var projectedPosX = this.posX + this.velocityX;
        var projectedRect = this.projectRect(projectedPosX, null);
        return Game.stage.anyCollisions(this, projectedRect);
    },

    willCollideUp: function () {
        if (!this.receivesCollision) {
            return false;
        }

        if (this.velocityY >= 0) {
            return false;
        }

        var projectedPosY = this.posY + this.velocityY;
        var projectedRect = this.projectRect(null, projectedPosY);
        return Game.stage.anyCollisions(this, projectedRect);
    },

    willCollideDown: function () {
        if (!this.receivesCollision) {
            return false;
        }

        if (this.velocityY <= 0) {
            return false;
        }

        var projectedPosY = this.posY + this.velocityY;
        var projectedRect = this.projectRect(null, projectedPosY);
        return Game.stage.anyCollisions(this, projectedRect);
    },

    rect: function () {
        return this.projectRect(null, null);
    },

    projectRect: function (x, y) {
        if (x == null) {
            x = this.posX;
        }

        if (y == null) {
            y = this.posY;
        }

        var r = { };
        r.width = this.width;
        r.height = this.height;
        r.left = x;
        r.top = y;
        r.right = r.left + r.width;
        r.bottom = r.top + r.height;
        return r;
    }
});