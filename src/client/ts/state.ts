import * as Game from '../../shared/game'

export interface App {
  socket: SocketIOClient.Socket
  server: {
    host: string
    port: string,
  }
  name: string
  started: boolean
  accepted: boolean

  assignment: number
  game: Game.State
  render: Matter.Render
}
