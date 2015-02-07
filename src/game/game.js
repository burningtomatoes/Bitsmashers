var Game = {
    buildCode: 1000,

    images: null,
    audio: null,
    stages: null,

    stage: null,

    init: function () {
        console.info('[Game] Initializing BitSmashers R' + this.buildCode + '...');

        Canvas.init();

        this.images = new ImageLoader();
        this.audio = new AudioLoader();
        this.stages = new StageLoader();
    },

    start: function () {
        console.info('[Game] Starting game...');

        this.loadStage('green');
    },

    loading: false,

    loadStage: function (id) {
        var stage = this.stages.load(id);
        stage.onLoaded = function () {
            Game.stage = stage;
        };
    },

    draw: function (ctx) {
        if (this.stage) {
            this.stage.draw(ctx);
        }
    },

    update: function () {
        if (this.stage) {
            this.stage.update();
        }
    }
};