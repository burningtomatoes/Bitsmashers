var Camera = {
    x: 0,
    y: 0,

    applyX: 0,
    applyY: 0,

    yLocked: false,
    xLocked: false,

    isRumbling: false,
    rumbleOffset: 0,
    rumbleIntensity: 1,
    rumbleDuration: 0,

    onMapLoaded: function () {
        this.xLocked = (Canvas.canvas.width > Game.stage.width);
        this.yLocked = (Canvas.canvas.height > Game.stage.height);

        var e = this.trackingEntity;

        if (this.xLocked || this.yLocked) {
            this.centerToMap();
        }

        if (e != null) {
            this.followEntity(e, true);
        }
    },

    translateX: function(x) {
        return Math.round(x + this.applyX + this.rumbleOffset);
    },

    translateY: function(y) {
        return Math.round(y + this.applyY + this.rumbleOffset);
    },

    translate: function(x, y) {
        return {
            x: this.translateX(x),
            y: this.translateY(y)
        };
    },

    setPos: function(x, y) {
        this.x = x;
        this.y = y;
    },

    trackingEntity: null,

    centerToMap: function() {
        if (Game.stage == null) {
            return;
        }

        this.x = Canvas.canvas.width / 2 - Game.stage.width / 2;
        this.y = Canvas.canvas.height / 2 - Game.stage.height / 2;
        this.xLocked = (Canvas.canvas.width > Game.stage.width);
        this.yLocked = (Canvas.canvas.height > Game.stage.height);
        this.trackingEntity = null;
    },

    trackHard: false,

    followEntity: function(e, hard) {
        this.trackingEntity = e;
        this.trackHard = !!hard;
    },

    rumble: function(duration, intensity) {
        this.isRumbling = true;
        this.rumbleOffset = 0;
        this.rumbleDuration = duration;
        this.rumbleIntensity = intensity;
    },

    update: function() {
        if (this.isRumbling) {
            this.rumbleDuration--;

            this.rumbleOffset = chance.integer({
                min: -this.rumbleIntensity,
                max: this.rumbleIntensity
            });

            if (this.rumbleDuration <= 0) {
                this.isRumbling = false;
                this.rumbleOffset = 0;
            }
        }
        
        if (this.trackingEntity != null) {
            if (!this.xLocked) {
                var desiredX = Canvas.canvas.width / 2 - this.trackingEntity.posX - this.trackingEntity.width / 2;
                var maxXSpace = Game.stage.width - Canvas.canvas.width;
                this.x = MathHelper.clamp(desiredX, -maxXSpace, 0);
            }

            if (!this.yLocked) {
                var desiredY = Canvas.canvas.height / 2 - this.trackingEntity.posY - this.trackingEntity.height / 2;
                var maxYSpace = Game.stage.height - Canvas.canvas.height;
                this.y = MathHelper.clamp(desiredY, -maxYSpace, 0);
            }
        }

        if (this.trackHard) {
            this.applyX = this.x;
            this.applyY = this.y;
            this.trackHard = false;
        } else {
            this.applyX = MathHelper.lerp(this.applyX, this.x, 0.1);
            this.applyY = MathHelper.lerp(this.applyY, this.y, 0.1);
        }
    }
};