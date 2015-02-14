Bitsmashers
=======
*An epic 8-bit fighting game full of pixelated awesomeness*

How to play
---
The Goal: Join other players online. Throw other players off the map and be the last person standing.

- Use A/S or Left/Right to move
- Use W or Up to jump, press again to double jump in mid-air
- Press SPACE to pick up blocks or other players
- Press SPACE to throw blocks and players against other players

Some tips:
- Throwing players off the map is the easiest way to win, but it's tricky
- When another players is carrying a block, jump on top of it to steal it away

WebRTC Multiplayer
---
This game was an online multiplayer expiriment, utilizing WebRTC data channels for realtime communication with peers. The matchmaking server is a signaling channel that communicates offers, answers, and ICE candidiates.

When you join a game, you broadcast an offer over the signaling server every few seconds. Any hosts will listen for these offers, and send answers if they have available slots. When the answer is accepted by the joining party, an exchange of ICE candidates begins, and a connection is set up.

Unfortunately the actual WebRTC data channel does not always work correctly, in particular things go wrong when the browser window loses focus. Because the WebRTC spec and implementation is ever-changing, there is a very good chance this game will stop working altogether at some point as new browser versions are released.

About the challenge
---
I built this game as part of my "build one game a week" challenge: one game per week, every week, even if it's crap (release often, fail often, and learn). I'm hoping to get better at game development during this process by pushing myself to deliver something every week and learning from previous weeks. Hopefully by releasing the source code to each game, my journey can be useful to you too.

Visit <http://www.burningtomato.com> for more info on my challenge. You can also follow me on Twitter: <https://twitter.com/burningtomato>.

Building the source code
---
You will need NodeJS and the Grunt CLI to build the source code.

1. Clone this repository using `git clone` to a new directory
2. Install the NodeJS dependencies by issuing the `npm install` command in a terminal
3. Compile the source code by issuing the `grunt` command in a terminal

Some side notes:

- Make sure you serve the files from a http:// address rather than a files:// address. Due to some security policies things may not work correctly otherwise.
- If you use an IDE, be sure to set up a file watcher so Grunt is ran automatically when you make changes. It'll make your life a lot easier.
- Your browser needs to have support for HTML5 and Canvas, obviously.

To compile the `game.scss` file, you will need to use SASS. For development convenience, I recommend setting this up as a file watcher task.

License
---
This game, and all my other games developed as part of this challenge, are available under the MIT license. See the included LICENSE file for details.

**Important:** For specific license information regarding third-party assets used in this game, please see the included CREDITS file.
