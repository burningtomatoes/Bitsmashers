var PlayerControls = {
    update: function () {
        if (Game.stage == null || Game.stage.player == null) {
            return;
        }

        var p = Game.stage.player;

        var keyMoveUp       = Keyboard.isKeyDown(KeyCode.W) || Keyboard.isKeyDown(KeyCode.UP);
        var keyMoveLeft     = Keyboard.isKeyDown(KeyCode.A) || Keyboard.isKeyDown(KeyCode.LEFT);
        var keyMoveRight    = Keyboard.isKeyDown(KeyCode.D) || Keyboard.isKeyDown(KeyCode.RIGHT);

        if (keyMoveUp && p.canMoveUp()) {
            p.velocityY -= p.movementSpeed;

            if (p.velocityY <= -p.movementSpeed) {
                p.velocityY = -p.movementSpeed;
            }
        }

        if (keyMoveLeft && p.canMoveLeft()) {
            p.velocityX -= p.movementSpeed;

            if (p.velocityX <= -p.movementSpeed) {
                p.velocityX = -p.movementSpeed;
            }
        }
        else if (keyMoveRight && p.canMoveRight()) {
            p.velocityX += p.movementSpeed;

            if (p.velocityX >= p.movementSpeed) {
                p.velocityX = p.movementSpeed;
            }
        }
        else {
            p.velocityX = 0;
        }

        console.log(p.velocityX);
    }
};