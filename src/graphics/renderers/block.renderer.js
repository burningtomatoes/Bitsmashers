var BlockRenderer = Renderer.extend({
    tileset: null,
    srcX: 0,
    srcY: 0,

    init: function (entity, tileset, srcX, srcY) {
        this._super(entity);

        this.tileset = tileset;
        this.srcX = srcX;
        this.srcY = srcY;
    },

    draw: function (ctx) {
        var x = Camera.translateX(this.entity.posX);
        var y = Camera.translateX(this.entity.posY);

        ctx.drawImage(this.tileset, this.srcX, this.srcY, Settings.TileSize, Settings.TileSize, x, y,
            Settings.TileSize, Settings.TileSize);
    }
});