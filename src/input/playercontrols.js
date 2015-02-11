var PlayerControls = {
    update: function () {
        if (Game.stage == null || Game.stage.player == null || !Game.stage.unlocked) {
            return;
        }

        var p = Game.stage.player;

        var keyMoveUp       = Keyboard.wasKeyPressed(KeyCode.W) || Keyboard.wasKeyPressed(KeyCode.UP);
        var keyMoveLeft     = Keyboard.isKeyDown(KeyCode.A) || Keyboard.isKeyDown(KeyCode.LEFT);
        var keyMoveRight    = Keyboard.isKeyDown(KeyCode.D) || Keyboard.isKeyDown(KeyCode.RIGHT);

        if (keyMoveUp && p.canMoveUp() && (p.landed || (p.jumped && !p.doubleJumped))) {
            p.velocityY -= p.jumpPower;

            if (p.velocityY <= -p.jumpPower) {
                p.velocityY = -p.jumpPower;
            }

            p.landed = false;

            if (p.jumped) {
                p.doubleJumped = true;
            }

            p.jumped = true;
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

        var syncMessage = p.prepareSyncMessage();

        if (Net.isHost) {
            Router.processData(syncMessage);
        } else {
            Net.getConnection().sendMessage(syncMessage);
        }
    }
};