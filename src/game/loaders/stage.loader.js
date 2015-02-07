var StageLoader = Loader.extend({
    readCache: function (id, defaultValue) {
        var data = this._super(id, defaultValue);

        if (data.isStage) {
            // Clear stages before returning them from cache
            data.clear();
        }
        return data;
    },

    innerLoad: function (filename) {
        var stage = new Stage();
        stage.id = filename;
    }
});