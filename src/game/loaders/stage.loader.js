var StageLoader = Loader.extend({
    contains: function () {
        return false;
    },

    readCache: function (id, defaultValue) {
        return null;
    },

    innerLoad: function (mapId) {
        console.info('[StageLoader] Loading stage `' + mapId + '.json` (Async operation started)');

        var stage = new Stage();
        stage.id = mapId;
        stage.onLoaded = function () {
            console.error('[MapLoader] Callback missed');
        };

        $.get('assets/stages/' + mapId + '.json')
            .success(function (data) {
                console.info('[StageLoader] Downloaded `' + mapId + '.json`. Configuring map data...');
                stage.loaded = false;

                this.configureStage(stage, data, function () {
                    stage.onLoaded(stage);
                    console.info('[StageLoader] Completed loading `' + mapId + '.json` (Async operation complete)');
                });
            }.bind(this))
            .error(function () {
                alert('CRITICAL: Could not load stage: ' + mapId + '. Press OK to restart game.');
                location.reload();
            });

        return stage;
    },

    configureStage: function (stage, data, cb) {
        stage.data = data;

        // 1. Configure all map properties
        stage.width = data.width * Settings.TileSize;
        stage.height = data.height * Settings.TileSize;

        if (data.properties.background) {
            stage.backgroundImage = Game.images.load(data.properties.background);
        }

        if (data.properties.gravity) {
            stage.gravity = parseFloat(data.properties.gravity);
        }

        // 2. Examine the map layers and spawn entities where needed
        var tilesetSrc = data.tilesets[0].image;
        tilesetSrc = tilesetSrc.replace('../images/', '');
        var tilesetImg = Game.images.load(tilesetSrc);

        var onload = function () {
            var tilesPerRow = data.tilesets[0].imagewidth / Settings.TileSize;

            var tidCache =  { };

            for (var i = 0; i < data.layers.length; i++) {
                var layer = data.layers[i];

                var x = -1;
                var y = 0;

                for (var j = 0; j < layer.data.length; j++) {
                    var tid = layer.data[j];

                    x++;

                    if (x >= data.width) {
                        y++;
                        x = 0;
                    }

                    if (tid === 0) {
                        continue;
                    }

                    tid--;

                    var layerType = 'regular';

                    if (layer.properties != null && layer.properties.type) {
                        layerType = layer.properties.type;
                    }

                    var fullRows = Math.floor(tid / tilesPerRow);
                    var srcY = fullRows * Settings.TileSize;
                    var srcX = (tid * Settings.TileSize) - (fullRows * tilesPerRow * Settings.TileSize);
                    var destX = x * Settings.TileSize;
                    var destY = y * Settings.TileSize;

                    switch (layerType) {
                        default:

                            // Determine the actual size of the bounding box for this TID
                            var bnd = null;

                            if (typeof tidCache[tid] != 'undefined') {
                                bnd = tidCache[tid];
                            } else {
                                bnd = Measure.determineBoundingBox(tilesetImg, srcX, srcY, Settings.TileSize, Settings.TileSize);
                                tidCache[tid] = bnd;
                            }

                            var entity = new BlockEntity();
                            entity.posX = destX;
                            entity.posY = destY;
                            entity.width = bnd.width;
                            entity.height = bnd.height;
                            entity.offsetX = bnd.startX;
                            entity.offsetY = bnd.startY;
                            entity.renderer = new BlockRenderer(entity, tilesetImg, srcX, srcY);
                            stage.add(entity);

                            break;

                        case 'player_spawns':

                            stage.playerSpawns.push({
                                x: destX,
                                y: destY
                            });

                            break;
                    } // end switch layer type
                } // end layer data for
            } // end layers for

            stage.loaded = true;
            stage.unlocked = false;

            cb(stage);
        };

        tilesetImg.onload = onload;

        if (tilesetImg.onloaded) {
            window.setTimeout(onload, 0);
        }
    }
});