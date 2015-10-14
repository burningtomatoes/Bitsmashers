var ImageLoader = Loader.extend({
    readCache: function (id, defaultValue) {
        if (!this.contains(id)) {
            return defaultValue;
        }

        var data = this.cache[id];
        data.onloaded = true;
        return data;
    },

    innerLoad: function (filename) {
        var image = new Image();
        image.src = 'assets/images/' + filename;
        image.onloaded = false;
        image.onload = function () { image.onloaded = true; };
        return image;
    }
});