var BlockEntity = Entity.extend({
    isBlock: true,
    receivesCollision: false,
    affectedByGravity: false,

    getName: function () {
        return 'A block';
    },

    smash: function (viaSync) {
        if (!viaSync) {
            // Ensure all clients are aware of the block being destroyed
            var netPayload = {
                op: Opcode.BLOCK_SMASH,
                i: this.id
            };

            if (Net.isHost) {
                Net.broadcastMessage(netPayload);
            } else {
                Net.getConnection().sendMessage(netPayload);
            }
        }

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
        Camera.rumble(10, 1);

        this.map.remove(this);
    }
});