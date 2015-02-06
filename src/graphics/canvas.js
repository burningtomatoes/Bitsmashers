var Canvas = {
    $canvas: null,
    canvas: null,
    context: null,

    scale: 1,

    screenWidth: 0,
    screenHeight: 0,

    lastRenderTime: null,
    fps: 0,

    init: function() {
        console.info('[Canvas] Starting rendering loop...');

        // Find the Canvas element we will be drawing to and retrieve the drawing context
        this.$canvas = $('#game');
        this.canvas = this.$canvas[0];
        this.context = this.canvas.getContext('2d');

        // Try to disable the "smooth" (stretched becomes blurry) scaling on the Canvas element
        // Instead, we want a "pixelated" effect (nearest neighbor scaling)
        this.canvas.mozImageSmoothingEnabled = false;
        this.canvas.webkitImageSmoothingEnabled = false;
        this.canvas.msImageSmoothingEnabled = false;
        this.canvas.imageSmoothingEnabled = false;

        // Begin the loop
        var loop = function() {
            window.requestAnimationFrame(loop);

            this.context.fillStyle = '#000';
            this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

            Game.draw(this.context);
            Game.update();

            if (Settings.countFps) {
                if (this.lastRenderTime == null) {
                    this.lastRenderTime = Date.now();
                    this.fps = 0;
                    return;
                }

                var delta = (new Date().getTime() - this.lastRenderTime) / 1000;
                this.lastRenderTime = Date.now();
                this.fps = 1 / delta;
            }
        }.bind(this);

        if (Settings.countFps) {
            window.setInterval(function() {
                $('#fps').show().text('FPS: ' + this.fps.toFixed(0));
            }.bind(this), 1000);
        }

        loop();
    }
};