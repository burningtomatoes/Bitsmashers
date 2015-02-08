var Game = {
    buildCode: 1000,

    images: null,
    audio: null,
    stages: null,

    stage: null,

    init: function () {
        console.info('[Game] Initializing BitSmashers R' + this.buildCode + '...');

        Canvas.init();
        Keyboard.bind();
        Network.init();

        this.images = new ImageLoader();
        this.audio = new AudioLoader();
        this.stages = new StageLoader();
    },

    start: function () {
        console.info('[Game] Starting game...');

        Canvas.$canvas.hide();

        BootLogo.show(function() {
            MainMenu.show();
        });
    },

    loading: false,

    loadStage: function (id) {
        var stage = this.stages.load(id);
        stage.onLoaded = function () {
            Game.stage = stage;
            Game.stage.setPlayer(new TheDoctorFighter());
            Camera.centerToMap();
        };
    },

    draw: function (ctx) {
        if (this.stage) {
            this.stage.draw(ctx);
        }

        Camera.update();
    },

    update: function () {
        if (this.stage) {
            this.stage.update();
            PlayerControls.update();
        }

        if (MainMenu.running) {
            MainMenu.update();
        }

        Keyboard.update();
    }
};