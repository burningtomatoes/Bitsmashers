var Animation = Class.extend({
    sprite: null,
    width: 0,
    height: 0,
    index: 0,
    animSpeed: 0,
    animTimer: 0,
    frameCount: 0,
    loop: false,
    done: false,
    isAnimation: true,

    init: function (sprite, width, height, animSpeed, frameCount, loop) {
        this.sprite = sprite;
        this.width = width;
        this.height = height;
        this.index = 0;
        this.animSpeed = animSpeed;
        this.animTimer = animSpeed;
        this.frameCount = frameCount;
        this.loop = !!(loop);
        this.done = false;
    },

    update: function () {
        if (this.animTimer > 0 && !this.done) {
            this.animTimer--;

            if (this.animTimer <= 0) {
                this.index++;

                if (this.index >= this.frameCount) {
                    if (this.loop) {
                        this.index = 0;
                    } else {
                        this.done = true;
                        this.index--;
                    }
                }

                this.animTimer = this.animSpeed;
            }
        }
    },

    draw: function (ctx, x, y) {
        ctx.drawImage(this.sprite, this.width * this.index, 0, this.width, this.height, x, y, this.width, this.height);
    }
});