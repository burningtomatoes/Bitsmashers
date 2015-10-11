var BlockEntity = Entity.extend({
    isBlock: true,
    receivesCollision: false,
    affectedByGravity: false,

    smash: function () {
        AudioOut.playSfx('impact.wav', 0.5);
        this.map.remove(this);
    }
});