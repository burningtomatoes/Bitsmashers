var Fighters = {
    TheDoctor: 'thedoctor'
};

var FighterEntity = Entity.extend({
    isPlayer: true,
    isFighter: true,

    fighterType: null,

    init: function () {
        this._super();

        this.posX = 170;
        this.posY = 100;

        this.velocityX = 1
    },

    configureRenderer: function () {
        this.renderer = new FighterRenderer(this);
    }
});