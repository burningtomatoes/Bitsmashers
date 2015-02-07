var Fighters = {
    TheDoctor: 'thedoctor'
};

var FighterEntity = Entity.extend({
    isPlayer: true,
    isFighter: true,

    fighterType: null,

    init: function () {
        this._super();

        this.posX = 100;
        this.posY = 100;
    },

    configureRenderer: function () {
        this.renderer = new FighterRenderer(this);
    }
});