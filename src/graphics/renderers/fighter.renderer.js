var FighterRenderer = Renderer.extend({
    spriteIdle: null,
    spriteWalk: null,
    spriteAttack: null,
    spriteJump: null,
    spriteHurt: null,

    animIdle: null,
    animAttack: null,
    animJump: null,

    flashHurt: false,

    init: function (entity) {
        this._super(entity);

        this.spriteIdle = Game.images.load(entity.fighterType + '.idle.png');
        this.spriteWalk = Game.images.load(entity.fighterType + '.walk.png');
        this.spriteAttack = Game.images.load(entity.fighterType + '.attack.png');
        this.spriteJump = Game.images.load(entity.fighterType + '.jump.png');

        this.animIdle = new Animation(this.spriteIdle, entity.width, entity.height, 10, 3, true);
        this.animWalk = new Animation(this.spriteWalk, entity.width, entity.height, 10, 3, true);
        this.animAttack = new Animation(this.spriteAttack, entity.width, entity.height, 10, 3, true);
        this.animJump = new Animation(this.spriteJump, entity.width, entity.height, 10, 3, true);

        this.generateHurtSprite();
    },

    generateHurtSprite: function() {
        // Use first frame of the attack animation (so they look to be in an "eek!" pose)
        FillSprite.make(this.spriteAttack, 0, 0, this.entity.width, this.entity.height, [255, 255, 255], function (resultImg) {
            this.spriteHurt = resultImg;
        }.bind(this));
    },

    update: function () {
        this.animIdle.update();
        this.animWalk.update();
        this.animAttack.update();
        this.animJump.update();
    },

    selectAnimation: function () {
        if (this.entity.isAttacking) {
            return this.animAttack;
        }
        else if (this.entity.isMoving()) {
            if (this.entity.isJumping() || this.entity.isFalling() || !this.entity.landed) {
                return this.animJump;
            } else {
                return this.animWalk;
            }
        } else {
            return this.animIdle;
        }
    },

    getPlayerColor: function () {
        return this.entity.player.getColor();
    },

    indicatorTimer: 0,

    draw: function (ctx) {
        if (this.entity.dead) {
            return;
        }

        var showIndicator = !this.entity.isMoving() && !this.entity.isAttacking;

        if (!showIndicator && Game.stage.unlocked) {
            this.indicatorTimer = 30;
        }

        if (this.indicatorTimer > 0) {
            this.indicatorTimer--;
            showIndicator = false;
        }

        if (showIndicator) {
            ctx.fillStyle = this.getPlayerColor();
            ctx.font="10px pixelmix";
            ctx.fillText("P" + this.entity.playerNumber, Camera.translateX(this.entity.posX + this.entity.width / 4 + 2), Camera.translateY(this.entity.posY));
        }

        ctx.save();

        if (this.entity.direction == Direction.LEFT) {
            ctx.translate(Camera.translateX(this.entity.posX + this.entity.width), Camera.translateY(this.entity.posY));
            ctx.scale(-1, 1);
        } else {
            ctx.translate(Camera.translateX(this.entity.posX), Camera.translateY(this.entity.posY));
        }

        if (this.flashHurt && this.spriteHurt != null) {
            ctx.drawImage(this.spriteHurt, 0, 0, this.entity.width, this.entity.height);
        } else {
            this.selectAnimation().draw(ctx, 0, 0);
        }

        if (showIndicator) {
            ctx.beginPath();
            ctx.moveTo(this.entity.width / 4, 5);
            ctx.lineTo(this.entity.width / 4 + this.entity.width / 2, 5);
            ctx.lineTo(this.entity.width / 4 + this.entity.width / 4, 15);
            ctx.fill();
        }

        ctx.restore();
    }
});