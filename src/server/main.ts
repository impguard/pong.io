import * as http from "http"
import * as planck from "planck-js"
import * as socketio from "socket.io"

import Server from "./Server"
import Game from "../shared/Game"
import * as state from "../shared/state"
import * as message from "../shared/message"
import { generateUniqueId } from "../shared/utils"

//
// Setup game manager
//

const manager = new Server({
  numPlayers: 8,
  paddle: {
    width: 1,
    height: 1,
  },
  base: {
    gap: 1,
    height: 1,
  },
  wall: {
    width: 1,
    height: 1,
  }
})

// TODO: adjust with better timestamp
setInterval(dt => manager.game.step(dt), 500, 500)

//
// Create socket server
//

const server = http.createServer()
const io = socketio(server)

const sockets: socketio.Socket[] = []
io.on("connection", socket => {

  socket.emit(message.Init.name, message.Init.marshal({
    gameState: manager.initialGameState
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