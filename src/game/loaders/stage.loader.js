var StageLoader = Loader.extend({
    readCache: function (id, defaultValue) {
        var data = this._super(id, defaultValue);

        if (data.isStage) {
            // Clear stages before returning them from cache
            data.clear();
            data.onLoaded();
        }
        return data;
    },

    innerLoad: function (mapId) {
        console.info('[StageLoader] Loading stage `' + mapId + '.json` (Async operation started)');

        var stage = new Stage();
        stage.id = mapId;
        stage.onLoaded = function () { console.error('[MapLoader] Callback missed'); };

        $.get('assets/stages/' + mapId + '.json')
            .success(function(data) {
                this.configureStage(stage, data);
                stage.onLoaded(stage);
                console.info('[StageLoader] Successfully loaded stage `' + mapId + '.json` (Async operation complete)');
            }.bind(this))
            .error(function() {
                alert('CRITICAL: Could not load stage: ' + mapId + '. Press OK to restart game.');
                location.reload();
            });

        return stage;
    },

    configureStage: function (stage, data) {
        stage.data = data;

        if (data.properties.background) {
            stage.backgroundImage = Game.images.load(data.properties.background);
        }
    }
});