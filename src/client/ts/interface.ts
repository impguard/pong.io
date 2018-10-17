import * as Game from '../../shared/game'
import CBuffer from './cbuffer'

export interface IApp {
  socket: SocketIOClient.Socket
  server: {
    host: string
    port: string,
  }
  name: string
  started: boolean
  accepted: boolean

  assignment: number
  inputs: CBuffer<Game.IInput>
  game: Game.IState
  render: Matter.Render
}
