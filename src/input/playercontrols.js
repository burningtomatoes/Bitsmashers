var PlayerControls = {
    update: function () {
        if (Game.stage == null || Game.stage.player == null || !Game.stage.unlocked) {
            return;
        }

        var p = Game.stage.player;

        if (p.dead || p.isProjectile) {
            return;
        }

        var didChange = false;

        // MOVE //////////////////////////////////////////////////////////////////////////////////////////////////////
        var keyMoveUp       = Keyboard.wasKeyPressed(KeyCode.W) || Keyboard.wasKeyPressed(KeyCode.UP);
        var keyMoveLeft     = Keyboard.isKeyDown(KeyCode.A) || Keyboard.isKeyDown(KeyCode.LEFT);
        var keyMoveRight    = Keyboard.isKeyDown(KeyCode.D) || Keyboard.isKeyDown(KeyCode.RIGHT);

        if (keyMoveUp && p.canMoveUp() && (p.landed || (p.jumped && !p.doubleJumped))) {
            p.velocityY -= p.jumpPower;

            if (p.velocityY <= -p.jumpPower) {
                p.velocityY = -p.jumpPower;
            }

            Particles.emit({
                x: p.posX,
                y: p.posY
            });

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

            didChange = true;
        }
        else if (keyMoveRight && p.canMoveRight()) {
            p.velocityX += p.movementSpeed;

            if (p.velocityX >= p.movementSpeed) {
                p.velocityX = p.movementSpeed;
            }

            didChange = true;
        }
        else {
            if (p.velocityX != null) {
                p.velocityX = 0;
                didChange = true;
            }
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
                    didChange = true;
                }
            }
        }
        else if (keyAttack && p.isAttacking) {
            // Throw!
            p.doThrow();
            didChange = true;
        }

        // NET SYNC ////////////////////////////////////////////////////////////////////////////////////////////////////
        if (didChange) {
            var syncMessage = p.prepareSyncMessage();

            if (Net.isHost) {
                Router.processData(syncMessage);
            } else {
                Net.getConnection().sendMessage(syncMessage);
            }
        }
    }
};