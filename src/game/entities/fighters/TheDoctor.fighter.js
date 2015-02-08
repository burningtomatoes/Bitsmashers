var TheDoctorFighter = FighterEntity.extend({
    init: function () {
        this._super();

        this.fighterType = Fighters.TheDoctor;

        this.width = 32;
        this.height = 64;

        this.xMargin = 5;
        this.yMargin = 22;

        this.movementSpeed = 3;
        this.jumpPower = 10;

        this.configureRenderer();
    }
});