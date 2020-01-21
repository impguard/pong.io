import * as io from "socket.io-client"
import * as planck from "planck-js"

import Manager from "./Manager"
import Game from "../shared/Game"
import * as message from "../shared/message"
import * as state from "../shared/state"

//
// Setup Client
//

interface SetupDef {
  context: CanvasRenderingContext2D
  width: number
  height: number
}

const initialize = (def: SetupDef) => {
  const socket = io.connect("http://localhost:8080")
  const manager = new Manager()

  // Socket initialization handshake
  socket.on(message.Init.name, buf => {
    const data = message.Init.unmarshal(buf)

    manager.init({
      initialGameState: data.gameState,
      config: data.config,
      ...def,
    })

    console.log("Initialize game with init packet: ", data)

    socket.emit(message.Ready.name)
  })

  // Game synchronization packet
  socket.on(message.State.name, buf => {
    const data = message.State.unmarshal(buf)

    console.log("Received state packet: ", data.partialGameState)

    manager.sync(data.partialGameState)
  })

  // Initialize render loop
  const render = () => {
    manager.render()
    requestAnimationFrame(render)
  }

  requestAnimationFrame(render)

  // Initialize client side physics step
  setInterval(dt => {
    manager.game.step(dt)
  }, 100, 0.1)
}

//
// Setup Client
//

declare global {
    interface Window { pong: any }
}

window.pong = {
  setup: initialize,
}