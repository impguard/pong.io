Client connects to game, gets initial game info
=> Server can choose to block client, or not
=> Generates physics/canvas/gamestate/all the things
=> Physics has references to all the game state objects

It will get state from the server
between state updates it will...

getinput
modify its player object based on input
run a simulation frame
based on location of objects, lerp position on screen

when game state received from server
server reconciliation
=> rollback current state
=> simulate forward based on history of inputs
