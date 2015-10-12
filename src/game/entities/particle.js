var ParticleEntity = Entity.extend({
    receivesDamage: false,
    causesTouchDamage: false,
    causesCollision: false,
    receivesCollision: true,
    affectedByGravity: false,

    color: '#fffff',
    life: 0,
    lifeMax: 0,
    explosion: false,

    init: function (x, y, h, w, l, color) {
        this.posX = x;
        this.posY = y;
        this.height = h;
        this.width = w;
        this.life = l;
        this.lifeMax = l;
        this.color = color;
    },

    update: function () {
        this.life--;

        if (this.life <= 0) {
            this.map.remove(this);
            return;
        }

        this.posX += this.velocityX;
        this.posY += this.velocityY;

        if (!this.explosion) {
            if (this.canMoveDown()) {
                this.velocityY += this.map.gravity;
            }
        }
    },

    draw: function (ctx) {
        var a = ctx.globalAlpha;
        var r = this.rect();
        ctx.beginPath();
        ctx.rect(Camera.translateX(r.left), Camera.translateY(r.top), r.width, r.height);
        ctx.globalAlpha = (this.life / this.lifeMax);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
        ctx.globalAlpha = a;
    }
});