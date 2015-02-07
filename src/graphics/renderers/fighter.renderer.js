var FighterRenderer = Renderer.extend({
    spriteIdle: null,
    spriteWalk: null,
    spriteAttack: null,
    spriteJump: null,

    animIdle: null,
    animAttack: null,
    animJump: null,

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
    },

    update: function () {
        this.animIdle.update();
        this.animWalk.update();
        this.animAttack.update();
        this.animJump.update();
    },

    selectAnimation: function () {
        // TODO Attack anim
        if (this.entity.isMoving()) {
            if (this.entity.isJumping() || this.entity.isFalling()) {
                return this.animJump;
            } else {
                return this.animWalk;
            }
        } else {
            return this.animIdle;
        }
    },

    draw: function (ctx) {
        ctx.save();

        if (this.entity.direction == Direction.LEFT) {
            ctx.translate(Camera.translateX(this.entity.posX + this.entity.width / 2), Camera.translateY(this.entity.posY));
            ctx.scale(-1, 1);
        } else {
            ctx.translate(Camera.translateX(this.entity.posX), Camera.translateY(this.entity.posY));
        }

        this.selectAnimation().draw(ctx, 0, 0);

        ctx.restore();
    }
});