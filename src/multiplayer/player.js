var Player = Entity.extend({
    connection: null,
    number: 1,
    isHost: false,

    init: function (connection, number) {
        this.connection = connection;
        this.number = number;
        this.isHost = false;
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