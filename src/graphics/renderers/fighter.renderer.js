var FighterRenderer = Renderer.extend({
    spriteIdle: null,
    spriteAttack: null,
    spriteJump: null,

    animIdle: null,
    animAttack: null,
    animJump: null,

    init: function (entity) {
        this._super(entity);

        this.spriteIdle = Game.images.load(entity.fighterType + '.idle.png');
        this.spriteAttack = Game.images.load(entity.fighterType + '.attack.png');
        this.spriteJump = Game.images.load(entity.fighterType + '.jump.png');

        this.animIdle = new Animation(this.spriteIdle, entity.width, entity.height, 10, 3, true);
        this.animAttack = new Animation(this.spriteIdle, entity.width, entity.height, 10, 3, true);
        this.animJump = new Animation(this.spriteIdle, entity.width, entity.height, 10, 3, true);
    },

    update: function () {
        this.animIdle.update();
        this.animAttack.update();
        this.animJump.update();
    },

    draw: function (ctx) {
        console.log('x');
        this.animIdle.draw(ctx, this.entity.posX, this.entity.posY);
    }
});