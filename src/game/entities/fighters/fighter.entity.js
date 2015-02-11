var Fighters = {
    TheDoctor: 'thedoctor'
};

var FighterEntity = Entity.extend({
    isPlayer: true,
    isFighter: true,

    fighterType: null,

    xMargin: 0,
    yMargin: 0,

    playerNumber: 0,

    init: function () {
        this._super();

        this.posX = 170;
        this.posY = 100;

        this.xMargin = 0;
        this.yMargin = 0;

        this.playerNumber = 0;
    },

    configureRenderer: function () {
        this.renderer = new FighterRenderer(this);
    },

    projectRect: function (x, y) {
        var r = this._super(x, y);

        r.top += this.yMargin;
        r.height -= this.yMargin;

        r.left += this.xMargin;
        r.width -= this.xMargin * 2;

        r.right = r.left + r.width;
        r.bottom = r.top + r.height;
        return r;
    },

    isLocalPlayer: function () {
        return (Game.stage.player === this);
    },

    prepareSyncMessage: function () {
        return {
            op: Opcode.PLAYER_UPDATE,
            p: this.playerNumber,
            x: this.posX,
            y: this.posY,
            vX: this.velocityX,
            vY: this.velocityY
        };
    },

    applySyncMessage: function (data) {
        this.posX = data.x;
        this.posY = data.y;
        this.velocityX = data.vX;
        this.velocityY = data.vY;
    }
});