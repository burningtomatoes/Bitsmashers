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
    },

    draw: function (ctx) {

    },

    update: function () {

    }
};