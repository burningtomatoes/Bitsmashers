var FillSprite = {
    make: function (image, x, y, w, h, colorRgbArray, cb) {
        if (!colorRgbArray) colorRgbArray = [255, 255, 255];

        // Generate a colored version of the given sprite
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');

        canvas.width = w;
        canvas.height = h;

        ctx.drawImage(image, x, y, w, h, 0, 0, w, h);

        var spriteData = ctx.getImageData(0, 0, w, h);
        var pixelData = spriteData.data;

        var hurtColor = colorRgbArray; // RGB format

        // Iterate the pixels in the first frame of the sprite we just loaded.
        // Each pixel has 4 bytes of information: Red, Green, Blue and Alpha.
        for (var i = 0; i < pixelData.length; i += 4) {
            pixelData[i] = hurtColor[0];
            pixelData[i + 1] = hurtColor[1];
            pixelData[i + 2] = hurtColor[2];
            // Pixels that were not previously set should still have a zero alpha (invisible).
            // We don't change alpha (the 4th value) but leave it as is.
            // End result: the sprite, where pixels were already visible, will have our color, while respecting partial transparency.
        }

        spriteData.data = pixelData;
        ctx.putImageData(spriteData, 0, 0);

        cb(canvas);
        return canvas;
    }
};