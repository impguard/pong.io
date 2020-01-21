import * as http from "http"
import * as planck from "planck-js"
import * as socketio from "socket.io"

import Manager from "./Manager"
import * as message from "../shared/message"

//
// Setup game manager
//

const manager = new Manager({
  numPlayers: 8,
  numBalls: 1,
  ball: {
    radius: 10,
    maxSpeed: 10,
  },
  paddle: {
    width: 60,
    height: 20,
  },
  base: {
    gap: 10,
    offset: 50,
    height: 5,
  },
  wall: {
    width: 30,
    height: 100,
  },
  map: {
    scale: 1000,
    gap: 200,
  },
})

// TODO: adjust with better timestamp
setInterval(dt => manager.game.step(dt), 500, 0.5)

//
// Create socket server
//

const server = http.createServer()
const io = socketio(server)

const sockets: socketio.Socket[] = []
io.on("connection", socket => {

  socket.emit(message.Init.name, message.Init.marshal({
    gameState: manager.initialGameState,
    config: manager.config,
  }))

  socket.on(message.Ready.name, () => {
    sockets.push(socket)
  })
})

setInterval(dt => {
  const partialGameState = manager.snapshot()

  sockets.forEach(socket => {
    socket.volatile.emit(message.State.name, message.State.marshal({
      partialGameState,
    }))
  })
}, 500)

server.listen(8080)