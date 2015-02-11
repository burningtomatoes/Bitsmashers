var PlayerControls = {
    update: function () {
        if (Game.stage == null || Game.stage.player == null || !Game.stage.unlocked) {
            return;
        }

        var p = Game.stage.player;

        if (p.dead || p.isProjectile) {
            return;
        }

        // MOVE //////////////////////////////////////////////////////////////////////////////////////////////////////
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

            AudioOut.playSfx('jump.wav', 0.75);
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

        // ATTACK //////////////////////////////////////////////////////////////////////////////////////////////////////
        var keyAttack = Keyboard.wasKeyPressed(KeyCode.ENTER) || Keyboard.wasKeyPressed(KeyCode.RETURN) || Keyboard.wasKeyPressed(KeyCode.SPACE);

        if (keyAttack && !p.isAttacking && p.landed) {
            // Determine attack radius (what can we pick up)
            var attackRadius = p.attackRect();

            // Find intersecting blocks
            var blocks = p.map.checkCollisions(p, attackRadius);

            if (blocks.length > 0) {
                var block = blocks[0];

                if (!block.isProjectile) {
                    p.pickUp(block);
                }
            }
        }
        else if (keyAttack && p.isAttacking) {
            // Throw!
            p.attackingWith.isProjectile = true;
            p.attackingWith.causesCollision = false;
            p.attackingWith.receivesCollision = true;
            p.attackingWith.affectedByGravity = true;
            p.attackingWith.velocityX = p.direction == Direction.LEFT ? -32 : 32;
            p.attackingWith = null;
            p.isAttacking = null;
            p.landed = true;
            p.jumped = false;
        }

        // NET SYNC ////////////////////////////////////////////////////////////////////////////////////////////////////
        var syncMessage = p.prepareSyncMessage();

        if (Net.isHost) {
            Router.processData(syncMessage);
        } else {
            Net.getConnection().sendMessage(syncMessage);
        }
    }
};