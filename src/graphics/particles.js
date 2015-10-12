var Particles = {
    emit: function (cfg) {
        var defaults = {
            x: 0,
            y: 0,
            min: 0,
            max: 100,
            sizeMin: 1,
            sizeMax: 3,
            spread: 5,
            color: 'red',
            lifeMin: 60,
            lifeMax: 120,
            explode: false,
            square: true,
            force: 10
        };

        cfg = $.extend(defaults, cfg);

        var amt = MathHelper.rand(cfg.min, cfg.max);

        for (var i = 0; i < amt; i++) {
            var x = cfg.x + MathHelper.rand(-cfg.spread, +cfg.spread);
            var y = cfg.y + MathHelper.rand(-cfg.spread, +cfg.spread);

            var h = MathHelper.rand(cfg.sizeMin, cfg.sizeMax);
            var w = !!cfg.square ? h : MathHelper.rand(cfg.sizeMin, cfg.sizeMax);

            var l = MathHelper.rand(cfg.lifeMin, cfg.lifeMax);

            var e = new ParticleEntity(x, y, h, w, l, cfg.color);
            e.velocityX = MathHelper.rand(-cfg.force, +cfg.force);
            e.velocityY = MathHelper.rand(-cfg.force, +cfg.force);
            e.explosion = !!cfg.explode;
            Game.stage.add(e);
        }
    }
};