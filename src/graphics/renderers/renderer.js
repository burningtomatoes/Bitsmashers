var Renderer = Class.extend({
    entity: null,

    init: function (entity) {
        this.entity = entity;
    },

    getMap: function () {
        return this.entity.map;
    },

    rect: function () {
        return this.entity.rect();
    },

    update: function () {
        // (Optionally, for animations, etc) To be implemented by children
    },

    draw: function (ctx) {
        // To be implemented by children
    }
});