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

    isProjectile: false,

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
        this.isProjectile = false;
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
        if (this.isProjectile) {
            var projectedPos = this.projectRect(this.posX + this.velocityX, this.posY + this.velocityY);
            var projectedIntersects = this.map.checkCollisions(this, projectedPos);

            this.velocityX *= 0.99;

            if (Math.abs(this.velocityX) <= 0.1) {
                if (this.isPlayer) {
                    this.isProjectile = false;
                    this.affectedByGravity = true;
                    this.causesCollision = true;
                    this.receivesCollision = true;
                } else {
                    AudioOut.playSfx('impact.wav', 0.2);
                    this.map.remove(this);
                }
            }
            else if (projectedIntersects.length > 0) {
                // Do we still have enough juice in us to defeat other entities?
                var willSelfShatter = Math.abs(this.velocityX) < 5;
                var intersectWith = projectedIntersects[0];

                // Slow ourselves down
                this.velocityX /= 2;
                this.velocityY /= 2;

                if (intersectWith.isBlock) {
                    if (!willSelfShatter) {
                        AudioOut.playSfx('impact.wav', 0.5);
                        this.map.remove(intersectWith);
                    }
                } else if (intersectWith.isPlayer) {
                    console.log('I hit a player!!!!');
                    AudioOut.playSfx('pain.wav', 0.5);
                    var throwbackPower = willSelfShatter ? 16 : 32;

                    if (this.velocityX < 0) {
                        // Coming in from the right
                        throwbackPower = -throwbackPower;
                    }

                    intersectWith.velocityX += throwbackPower;
                    intersectWith.affectedByGravity = true;
                    intersectWith.causesCollision = false;
                    intersectWith.receivesCollision = false;
                    intersectWith.isProjectile = true;
                }

                if (willSelfShatter) {
                    AudioOut.playSfx('impact.wav', 0.5);
                    this.map.remove(this);
                }
            }
        }

        if ((this.velocityY < 0 && this.willCollideUp()) || (this.velocityY > 0 && this.willCollideDown())) {
            this.velocityY = 0;
        }

        if ((this.velocityX < 0 && this.willCollideLeft()) || (this.velocityX > 0 && this.willCollideRight())) {
            this.velocityX = 0;
        }

        if (this.isPlayer && !this.isProjectile && !this.isLocalPlayer() && !this.jumped && this.isJumping()) {
            AudioOut.playSfx('jump.wav', 0.25);
            this.jumped = true;
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
            AudioOut.playSfx('land.wav', (!this.isPlayer || !this.isLocalPlayer() ? 0.35 : 0.8));
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

            var sq = this.attackRect();

            ctx.beginPath();
            ctx.rect(Camera.translateX(sq.left), Camera.translateY(sq.top), sq.width, sq.height);
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'purple';
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
    },

    attackRect: function () {
        var attackRadius = this.rect();
        attackRadius.width /= 2;
        attackRadius.height /= 2;
        attackRadius.left += (attackRadius.width / 2);
        attackRadius.top += attackRadius.height + (attackRadius.width / 2);
        attackRadius.right = attackRadius.left + attackRadius.width;
        attackRadius.bottom = attackRadius.top + attackRadius.height;
        return attackRadius;
    }
});