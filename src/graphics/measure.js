var Measure = {
    determineBoundingBox: function (img, x, y, h, w) {
        var canvas = document.createElement('canvas');
        canvas.height = h;
        canvas.width = w;
        var context = canvas.getContext('2d');

        context.drawImage(img, x, y, h, w, 0, 0, h, w);

        var imgData = context.getImageData(0, 0, h, w).data;

        var result = {
            startX: null,
            startY: null,
            endX: null,
            endY: null,
            width: w,
            height: h
        };

        // Each pixel is represented by three bytes: R G B A
        // If A is zero, then that means the pixel is invisible
        // We try to detect the highest and lowest pixel in both X and Y axis
        // This should eventually result in a bounding box
        for (var i = 0; i < imgData.length; i += 4) {
            var r = imgData[i];
            var g = imgData[i + 1];
            var b = imgData[i + 2];
            var a = imgData[i + 3];

            var pixelNumber = i / 4; // one pixel per 4 bytes
            var y = Math.floor(pixelNumber / w); // complete rows passed so far
            var x = pixelNumber - (y * w); // position within the current row

            //console.log(x, y, r, g, b, a);

            if (a > 0) {
                // Pixel is filled
                if (x < result.startX || result.startX == null) {
                    result.startX = x;
                }
                if (x > result.endX || result.endX == null) {
                    result.endX = x;
                }

                if (y < result.startY || result.startY == null) {
                    result.startY = y;
                }
                if (y > result.endY || result.endY == null) {
                    result.endY = y;
                }
            }
        }

        // plus 1 because of reasons. I dunno. it's the only way it ends up correct
        result.width = 1 + (result.endX - result.startX);
        result.height = 1 + (result.endY - result.startY);
        return result;
    }
}