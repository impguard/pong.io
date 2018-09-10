import * as io from 'socket.io-client'

const submitElem = document.getElementById('submit')
const hostElem = <HTMLInputElement> document.getElementById('host')
const portElem = <HTMLInputElement> document.getElementById('port')
const outputElem = <HTMLTextAreaElement> document.getElementById('output')

const log = (data) => {
  outputElem.value += data + '\n'
}

let socket: SocketIOClient.Socket

submitElem.addEventListener('click', () => {
  const host = hostElem.value
  const port = portElem.value

  if (socket) {
    socket.disconnect()
  }

  socket = io(`${host}:${port}`)
  socket.on('time', log)
})

// Client connects to game, gets initial game info
// => Server can choose to block client, or not
// => Generates physics/canvas/gamestate/all the things
// => Physics has references to all the game state objects

// It will get state from the server
// between state updates it will...
//
// getinput
// modify its player object based on input
// run a simulation frame
// based on location of objects, lerp position on screen
//
// when game state received from server
// server reconciliation
// => rollback current state
// => simulate forward based on history of inputs
