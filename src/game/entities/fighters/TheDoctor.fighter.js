var TheDoctorFighter = FighterEntity.extend({
    init: function () {
        this._super();

        this.fighterType = Fighters.TheDoctor;
        this.width = 32;
        this.height = 64;

        this.configureRenderer();
    }
});