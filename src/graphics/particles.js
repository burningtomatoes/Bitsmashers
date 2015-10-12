var Particles = {
    emit: function (cfg) {
        var defaults = {
            x: 0,
            y: 0,
            amtMin: 0,
            amtMax: 100,
            sizeMin: 1,
            sizeMax: 3,
            spread: 5,
            color: 'red',
            lifeMin: 60,
            lifeMax: 120
        };

        cfg = $.extend(defaults, cfg);

        var amt = MathHelper.rand(cfg.amtMin, cfg.amtMax);

        for (var i = 0; i < amt; i++) {
            var x = cfg.x + MathHelper.rand(-cfg.spread, +cfg.spread);
            var y = cfg.y + MathHelper.rand(-cfg.spread, +cfg.spread);

            var h = MathHelper.rand(cfg.sizeMin, cfg.sizeMax);
            var w = MathHelper.rand(cfg.sizeMin, cfg.sizeMax);

            var l = MathHelper.rand(cfg.lifeMin, cfg.lifeMax);

            var e = new ParticleEntity(x, y, h, w, l, cfg.color);
            e.velocityX = MathHelper.rand(-10, 10);
            e.velocityY = MathHelper.rand(-10, 10);
            Game.stage.add(e);
        }
    }
};