import * as io from "socket.io-client"
import * as planck from "planck-js"

import Client from "./Client"
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
  const manager = new Client()

  socket.on(message.Init.name, buf => {
    const data = message.Init.unmarshal(buf)

    manager.init({
      initialGameState: data.gameState,
      ...def,
    })

    console.log("Initialize game with initial state: ", data.gameState)

    socket.emit(message.Ready.name)
  })

  socket.on(message.State.name, buf => {
    const data = message.State.unmarshal(buf)

    console.log("Received state packet: ", data.partialGameState)

    manager.sync(data.partialGameState)
  })

  const render = () => {
    manager.render()
    requestAnimationFrame(render)
  }

  requestAnimationFrame(render)
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