var Player = Entity.extend({
    connection: null,
    number: 1,

    init: function (connection, number) {
        this.connection = connection;
        this.number = number;
    }
});