var Game = {
    buildCode: 1000,

    images: null,
    audio: null,
    stages: null,

    stage: null,

    inGame: false,

    init: function () {
        console.info('[Game] Initializing BitSmashers R' + this.buildCode + '...');

        Canvas.init();
        Keyboard.bind();
        Net.init();

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
        $('#mainmenu').fadeOut();
        $('#game').fadeIn();

        var stage = this.stages.load(id);
        stage.onLoaded = function () {
            Game.stage = stage;
            Game.stage.setPlayer(new TheDoctorFighter());
            Game.inGame = true;
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