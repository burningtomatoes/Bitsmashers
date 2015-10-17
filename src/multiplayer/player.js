var Player = Entity.extend({
    connection: null,
    number: 1,

    init: function (connection, number) {
        this.connection = connection;
        this.number = number;
    },

    getColor: function () {
        switch (this.number) {
            default:
            case 1:
                return 'red';
            case 2:
                return 'yellow';
            case 3:
                return 'blue';
            case 4:
                return 'green';
        }
    }
});