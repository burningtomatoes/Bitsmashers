var BlockEntity = Entity.extend({
    isBlock: true,
    receivesCollision: false,
    affectedByGravity: false,

    smash: function () {
        Particles.emit({
            x: this.posX + (this.width / 2),
            y: this.posY + (this.height / 2),
            min: 50,
            max: 75,
            sizeMin: 2,
            sizeMax: 3,
            color: '#8A4B08',
            square: false,
            lifeMin: 10,
            lifeMax: 60,
            force: 6
        });

        AudioOut.playSfx('impact.wav', 0.5);
        this.map.remove(this);
    }
});