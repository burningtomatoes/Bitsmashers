var ImageLoader = Loader.extend({
    innerLoad: function (filename) {
        var image = new Image();
        image.src = 'assets/images/' + filename;
        return image;
    }
});